from typing import List, Dict
from flask import Flask, request, jsonify, abort
from flask_cors import CORS, cross_origin

import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.manifold import TSNE

from .reader import read_mts
from .t2f.extractor import feature_extraction
from .t2f.importance import feature_selection
from .t2f.clustering import ClusterWrapper, cluster_metrics

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, supports_credentials=True)


@app.errorhandler(400)
def resource_not_found(e):
    return jsonify(error=str(e)), 400


@cross_origin()
@app.post('/reader')
def reader_post():
    print('q')
    f = request.files['file']
    df, y = read_mts(f)
    res = {
        'data': df,
        'labels': list(y)
    }
    return jsonify(res)


@cross_origin()
@app.post('/extraction')
def feature_extraction_post():
    def ts_2_array(ts_list: List[Dict[str, List[float]]]):
        arr = [pd.DataFrame(ts).values for ts in ts_list]
        return arr

    def check_data(arr: List[np.array]):
        shapes = [ts.shape for ts in arr]
        return len(set(shapes)) == 1

    ts_data = request.json.get('data', [])  # List of time series
    batch_size = request.json.get('batch_size', 64)  # Batch size for feature extraction
    p = request.json.get('p', 2)  # Number of processor to use in feature extraction

    # Missing data error
    if not ts_data:
        abort(400, 'List of time series is missing')

    # Transform list of time series into array for feature extraction
    ts_arr = ts_2_array(ts_data)

    # Check time series shape homogeneity
    if not check_data(ts_arr):
        abort(400, 'Some time series have different shapes')

    # Feature extraction step
    ts_arr = np.array(ts_arr)
    df = feature_extraction(ts_list=ts_arr, batch_size=batch_size, p=p)
    # Transform dataframe into json object
    res = df.to_json(orient='records')
    res = json.loads(res)
    return jsonify(res)


@cross_origin()
@app.post('/split')
def train_split_post():
    labels = request.json.get('labels', [])  # List of labels
    train_size = request.json.get('train_size', 0)  # Training size

    # Check labels
    if not labels:
        # No labels in the request object
        abort(400, 'List of labels is missing')
    if train_size < 0:
        # Train size is not greater than 0
        abort(400, 'Train size must be greater than 0')

    # Extract training labels
    indexes = np.arange(len(labels))
    pos_train, _, y_train, _ = train_test_split(indexes, labels, train_size=train_size)

    # Define integer index
    pos_train = pos_train.tolist()

    # Define integer class
    y_train = pd.get_dummies(y_train).sort_index(axis=1).apply(np.argmax, axis=1).to_list()

    # Create labels to pass in the request
    label_train = {i: j for i, j in zip(pos_train, y_train)}

    # Create response object
    res = label_train

    return jsonify(res)


@cross_origin()
@app.post('/selection')
def feature_selection_post():
    ts_feats = request.json.get('data', [])  # List of transformed time series
    labels = request.json.get('labels', {})  # Labels
    model_type = request.json.get('model_type')  # Clustering method
    transform_type = request.json.get('transform_type')  # Transformation method

    # Missing data error
    if not ts_feats:
        abort(400, 'List of transformed time series is missing')

    # Missing model and transform types for semi-supervised scenario
    if labels:
        if model_type is None or transform_type is None:
            abort(400, 'Model and transform types are required to perform semi-supervised feature selection')

        labels = {int(i): j for i, j in labels.items()}

    # Create pandas dataframe
    ts_feats = pd.DataFrame(ts_feats)

    # Feature selection step
    context = {'model_type': model_type, 'transform_type': transform_type}
    top_feats = feature_selection(ts_feats, labels=labels, context=context)

    # Transform dataframe into json object
    res = ts_feats[top_feats].to_json(orient='records')
    res = json.loads(res)

    return jsonify(res)


@cross_origin()
@app.post('/clustering')
def clustering_post():
    ts_feats = request.json.get('data', [])  # List of transformed time series
    n_clusters = request.json.get('n_clusters', 0)  # Number of cluster to detect
    model_type = request.json.get('model_type')  # Clustering method
    transform_type = request.json.get('transform_type')  # Transformation method

    # Missing params
    if not ts_feats or not n_clusters or model_type is None or transform_type is None:
        abort(400, 'Missing arguments')

    # Create pandas dataframe
    ts_feats = pd.DataFrame(ts_feats)

    # Clustering step
    model = ClusterWrapper(n_clusters=n_clusters, model_type=model_type, transform_type=transform_type)
    y_pred = model.fit_predict(ts_feats)
    y_pred = y_pred.tolist()
    return jsonify(y_pred)


@cross_origin()
@app.post('/evaluation')
def evaluation_post():
    labels = request.json.get('labels', [])  # Labels
    preds = request.json.get('preds', [])  # Model prediction

    # Missing params
    if not labels or not preds:
        abort(400, 'Missing arguments')

    # Evaluation step
    metrics = cluster_metrics(labels, preds)

    return jsonify(metrics)


@cross_origin()
@app.post('/ranking')
def ranking_pivot_post():
    pos_idx = request.json.get('idx', None)  # Positional index of record in ts_feats to use like pivot
    ts_feats = request.json.get('data', [])  # List of transformed time series
    preds = request.json.get('preds', [])  # Model prediction

    # Missing params
    if pos_idx is None or not ts_feats or not preds:
        abort(400, 'Missing arguments: idx, data, and/or preds')

    # Create pandas dataframe
    ts_feats = pd.DataFrame(ts_feats)

    if pos_idx >= len(ts_feats):
        abort(400, 'Positional index is out of bounds respect to the dataset')

    # Select the pivot record
    ts_pivot = ts_feats.iloc[[pos_idx]]
    # Remove pivot from the dataset and the prediction array
    ts_feats = ts_feats.drop(ts_feats.index[pos_idx], axis=0)
    preds.pop(pos_idx)

    # Compute ranking based on euclidean distances
    dist = euclidean_distances(ts_pivot.values, ts_feats.values)
    ranks = np.argsort(dist[0, :])

    # Create a numpy array for an easy selection
    preds = np.array(preds)

    # Order dataset and prediction based on ranking order
    preds = preds[ranks]
    ts_feats = ts_feats.iloc[ranks]

    # Insert distance and position column in dataset
    columns = list(ts_feats.columns)
    ts_feats['DISTANCE'] = dist[0, :][ranks]
    ts_feats['IDX'] = ts_feats.index

    columns = ['IDX', 'DISTANCE'] + columns
    ts_feats = ts_feats[columns]

    # Transform dataframe into json object
    ts_feats = ts_feats.to_json(orient='records')
    ts_feats = json.loads(ts_feats)

    # Transform preds into list
    preds = preds.tolist()

    res = {
        'data': ts_feats,
        'preds': preds,
    }

    return jsonify(res)


@cross_origin()
@app.post('/tsne')
def tsne_post():
    ts_feats = request.json.get('data', [])  # List of transformed time series
    preds = request.json.get('preds', [])  # Model prediction

    # Missing params
    if not ts_feats or not preds:
        abort(400, 'Missing data or preds arguments')
    if len(ts_feats) != len(preds):
        abort(400, 'data and preds must have the same length')

    # Create pandas dataframe
    ts_feats = pd.DataFrame(ts_feats)

    # TSNE X and Y coordinates
    tsne = TSNE(learning_rate='auto', init='pca', n_iter=1000)
    arr = tsne.fit_transform(ts_feats)
    df_tsne = pd.DataFrame({'x': arr[:, 0], 'y': arr[:, 1]})

    # Append preds in TSNE coordinates
    df_tsne['label'] = preds

    # Transform dataframe into json object
    df_tsne = df_tsne.to_json(orient='records')
    df_tsne = json.loads(df_tsne)

    return jsonify(df_tsne)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
