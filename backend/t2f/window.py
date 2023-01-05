import numpy as np


from .clustering import ClusterWrapper, cluster_metrics


def get_sliding_window_matrix(data: np.array, window: int, stride: int):
    """ Apply sliding window strategy to input matrix """
    # Extra array dimensions
    rows, cols = data.shape
    if window == 0:
        # Special case which return a single row array
        window = rows

    # Compute new window matrix rows
    new_rows = 1 + (rows - window) // stride

    matrix = np.zeros((new_rows, window, cols))

    for i in range(new_rows):
        left = i * stride
        right = left + window
        matrix[i, :, :] = data[left:right, :]

    return matrix


def prepare_data(ts_list: list, labels: list, kernel: int, stride: int = 1):
    """ Concatenate all time series with several labels to extract x and y  """
    # Create slide window matrix for each time series
    x_list = [get_sliding_window_matrix(ts.values, kernel, stride) for ts in ts_list]

    # Assign labels for each matrix values
    y = np.hstack([[i] * len(x) for i, x in zip(labels, x_list)])
    x = np.vstack(x_list)

    return x, y


def compute_simple_cluster_ranking(y_true: np.array, y_pred: np.array):
    """ Compute three clustering metrics and return the average """
    metrics = cluster_metrics(y_true, y_pred)
    return np.mean([metrics['ami'], metrics['rand'], metrics['homogeneity']])



