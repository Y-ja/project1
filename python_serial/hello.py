import serial
from time import sleep

# Serial 포트 초기화
sp = serial.Serial(port='COM3', baudrate=9600, timeout=1)  # timeout을 1초로 설정하여 읽기 지연 방지

try:
    while True:
        if sp.in_waiting > 0:  # 데이터가 버퍼에 존재하는지 확인
            rcv = sp.readline()  # 한 줄을 읽어옵니다
            print(rcv.decode().strip())  # 읽어온 데이터를 디코딩하고 줄 끝의 공백을 제거하여 출력합니다
        
        sleep(0.1)  # 0.1초 대기 (필요에 따라 조정 가능)

except KeyboardInterrupt:
    print("프로그램이 중단되었습니다.")
finally:
    sp.close()  # Serial 포트를 닫습니다
