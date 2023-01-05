import requests
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def scenario(semisupervised: bool = False):
    """ Scenario1&2: Multivariate Time Series Dataset with Label and Unsupervised or Semi Supervised Clustering """
    # Read multivariate time series dataset request
    filename = 'data/BasicMotionsNoLabel.txt'  # Dataset file path
    # Create request object
    files = {'file': open(filename, 'rb')}
    r = requests.post('http://localhost:5000/reader', files=files)
    res = r.json()

    ts_list = res['data']
    labels = res.get('labels', None)  # Optional parameters

    # Feature extraction request
    payload = {'data': ts_list, 'batch_size': 100, 'p': 2}
    r = requests.post('http://localhost:5000/extraction', json=payload)
    ts_feats = r.json()

    if semisupervised and labels:
        # Extract some label
        indexes = np.arange(len(labels))
        pos_train, _, y_train, _ = train_test_split(indexes, labels, train_size=16)

        # Define integer index
        pos_train = pos_train.tolist()

        # Define integer class
        y_train = pd.get_dummies(y_train).sort_index(axis=1).apply(np.argmax, axis=1).to_list()

        # Create labels to pass in the request
        label_train = {i: j for i, j in zip(pos_train, y_train)}
        # Semisupervised feature selection
        payload = {'data': ts_feats, 'labels': label_train, 'model_type': 'Hierarchical', 'transform_type': 'minmax'}

    else:
        # Unsupervised feature selection
        payload = {'data': ts_feats}

    r = requests.post('http://localhost:5000/selection', json=payload)
    ts_feats = r.json()

    # Clustering request
    payload = {'data': ts_feats, 'n_clusters': 4, 'model_type': 'Hierarchical', 'transform_type': 'minmax'}
    r = requests.post('http://localhost:5000/clustering', json=payload)
    preds = r.json()

    # Evaluation request
    if labels:
        payload = {'preds': preds, 'labels': labels}
        r = requests.post('http://localhost:5000/evaluation', json=payload)
        metrics = r.json()
        print(metrics)


if __name__ == '__main__':
    scenario(semisupervised=False)
