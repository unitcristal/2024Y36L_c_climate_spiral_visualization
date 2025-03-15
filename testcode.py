import numpy as np
import time

def performance_test(matrix_size=500, iterations=10):
    """
    행렬 곱셈 성능을 테스트하는 함수.
    Parameters:
        matrix_size (int): 행렬의 크기 (matrix_size x matrix_size).
        iterations (int): 반복 횟수.
    """
    # 임의의 행렬 생성
    A = np.random.rand(matrix_size, matrix_size)
    B = np.random.rand(matrix_size, matrix_size)

    start_time = time.time()

    for _ in range(iterations):
        _ = np.dot(A, B)  # 행렬 곱셈

    elapsed_time = time.time() - start_time
    print(f"Matrix size: {matrix_size}x{matrix_size}, Iterations: {iterations}")
    print(f"Elapsed time: {elapsed_time:.4f} seconds")

if __name__ == "__main__":
    # 테스트 실행
    performance_test(matrix_size=500, iterations=5000)