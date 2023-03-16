import requests
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split


def scenario(semisupervised: bool = False, analytics: bool = False):
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

    # Analytics requests
    if analytics:
        # Ranking based on pivot
        pivot_idx = 0
        payload = {'preds': preds, 'data': ts_feats, 'idx': pivot_idx}
        r = requests.post('http://localhost:5000/ranking', json=payload)
        res = r.json()
        ts_feats_ranked = res['data']
        preds_ranked = res['preds']

        # Show top 3 time series respect to pivot_idx
        df = pd.DataFrame(ts_feats_ranked)
        df['Label'] = preds_ranked

        print(f'\nRanking for idx: {pivot_idx}')
        print(f'Pivot: {pd.DataFrame([ts_feats[pivot_idx]])}')
        print(df.head(3))

        # TSNE visualization
        payload = {'data': ts_feats, 'preds': preds}
        r = requests.post('http://localhost:5000/tsne', json=payload)
        ts_tsne = r.json()

        # Show tsne coordinates with scatter plot
        df_tsne = pd.DataFrame(ts_tsne)

        df_tsne.plot.scatter(x='X', y='Y', c='Label', colormap='viridis')
        plt.show()


if __name__ == '__main__':
    scenario(semisupervised=True, analytics=True)
