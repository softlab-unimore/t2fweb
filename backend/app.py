from typing import List, Dict
from flask import Flask, request, jsonify, abort
from flask_cors import CORS, cross_origin

import json
import numpy as np
import pandas as pd

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


if __name__ == '__main__':
    app.run(port=5000, debug=True)
