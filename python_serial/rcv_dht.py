import serial
import pymysql
from contextlib import closing

# Serial 포트 초기화
sp = serial.Serial(port='COM3', baudrate=9600, timeout=1)

# MySQL 데이터베이스 연결 설정
db_config = {
    'host': '10.10.13.130',
    'user': 'user1',
    'password': '1234',
    'db': 'dht11',
    'charset': 'utf8'
}

def execute_query(query, values=None):
    """SQL 쿼리 실행"""
    with closing(pymysql.connect(**db_config)) as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, values)
            conn.commit()

def insert_data(temperature, humidity):
    """데이터 삽입"""
    query = "INSERT INTO location1 (Temperature, Humidity) VALUES (%s, %s)"
    execute_query(query, (temperature, humidity))

def delete_data(id):
    """데이터 삭제"""
    query = "DELETE FROM location1 WHERE id = %s"
    execute_query(query, (id,))

def update_data(id, temperature, humidity):
    """데이터 업데이트"""
    query = "UPDATE location1 SET Temperature = %s, Humidity = %s WHERE id = %s"
    execute_query(query, (temperature, humidity, id))

def select_data():
    """데이터 조회"""
    query = "SELECT * FROM location1"
    with closing(pymysql.connect(**db_config)) as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            for row in cursor.fetchall():
                print(row)

def parse_data(rcv):
    """데이터를 파싱하여 온도와 습도를 반환하는 함수"""
    if rcv.startswith("humi"):
        return int(rcv[4:6]), None
    elif rcv.startswith("temp"):
        return None, int(rcv[4:6])
    return None, None

try:
    # 기존 데이터 삭제 (예: ID가 13인 데이터 삭제)
    delete_data(13)

    while True:
        if sp.in_waiting > 0:
            rcv = sp.readline().decode().strip()
            humi, temp = parse_data(rcv)
            
            if humi is not None and temp is not None:
                # 온도와 습도 모두 있을 경우 데이터 삽입
                insert_data(temp, humi)
            elif humi is not None:
                print(f"습도: {humi}")
            elif temp is not None:
                print(f"온도: {temp}")

except KeyboardInterrupt:
    print("프로그램이 중단되었습니다.")
finally:
    sp.close()
