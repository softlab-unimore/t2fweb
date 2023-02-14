import requests
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def scenario(semisupervised: bool = False):
    """ Scenario1&2: Multivariate Time Series Dataset with Label and Unsupervised or Semi Supervised Clustering """
    # Read multivariate time series dataset request
    filename = 'data/BasicMotionsLabel.txt'  # Dataset file path
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
        # Read training labels to pass in the semi-supervised selection request
        payload = {'labels': labels, 'train_size': 0.4}
        r = requests.post('http://localhost:5000/split', json=payload)
        label_train = r.json()

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
    scenario(semisupervised=True)
