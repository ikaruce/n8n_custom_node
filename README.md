# n8n-nodes-shell-execute

n8n 인스턴스에서 쉘 명령어를 실행하는 커스텀 노드입니다.
`TOKEN`, `BASE_URL`, `VERSION` 을 환경변수로 자동 주입하여 스크립트에서 바로 사용할 수 있습니다.

---

## 설치

n8n 커스텀 노드 디렉토리에서 설치합니다.

```bash
npm install n8n-nodes-shell-execute
```

또는 로컬 경로로 직접 설치:

```bash
npm install /path/to/n8n-nodes-shell-execute
```

설치 후 n8n을 재시작하면 노드 팔레트에서 **Shell Execute** 노드를 찾을 수 있습니다.

---

## Credential 설정

**Shell Execute API** 크리덴셜을 생성하고 토큰을 입력합니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `Token` | string (password) | 쉘 명령 실행 시 `TOKEN` 환경변수로 주입 |

---

## 노드 파라미터

| 파라미터 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| `Base URL` | string | `http://localhost:5678` | ✅ | `BASE_URL` 환경변수로 주입 |
| `Version` | string | `v1` | ✅ | `VERSION` 환경변수로 주입 |
| `Command` | string (multiline) | - | ✅ | 실행할 쉘 명령어 |
| `Working Directory` | string | - | | 명령을 실행할 디렉토리 |
| `Timeout (ms)` | number | `60000` | | 최대 실행 시간 (밀리초) |

---

## 환경변수 주입

노드 실행 시 아래 환경변수가 자동으로 자식 프로세스에 주입됩니다.

| 환경변수 | 값 |
|---|---|
| `TOKEN` | Credential에 저장된 토큰 |
| `BASE_URL` | 노드 파라미터 `Base URL` |
| `VERSION` | 노드 파라미터 `Version` |

스크립트 예시:

```bash
# TOKEN, BASE_URL, VERSION 을 그대로 사용 가능
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/$VERSION/status"
```

---

## 출력

명령 실행 결과는 다음 필드로 반환됩니다.

```json
{
  "stdout": "명령 실행 출력",
  "stderr": "오류 출력 (없으면 빈 문자열)",
  "exitCode": 0
}
```

| 필드 | 설명 |
|---|---|
| `stdout` | 표준 출력 |
| `stderr` | 표준 에러 출력 |
| `exitCode` | 프로세스 종료 코드 (`0` = 성공) |

---

## 에러 처리

- **Continue On Fail** 비활성화 (기본): 명령 실패 시 워크플로우 중단
- **Continue On Fail** 활성화: 에러 정보를 출력으로 반환하고 계속 진행

```json
{
  "stdout": "",
  "stderr": "command not found: foo",
  "exitCode": 127,
  "error": true
}
```

---

## 개발

```bash
# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# 감시 모드 (변경 시 자동 빌드)
npm run dev
```

---

## 라이선스

MIT
