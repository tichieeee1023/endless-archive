import type { Encounter } from "../types/encounter";

/** Independent passenger stories: first meetings stay random, follow-ups are optional. */
export const SIDE_STORY_ENCOUNTERS: Encounter[] = [
  {
    "id": "side_child_1",
    "kind": "event",
    "title": "이름표 없는 아이",
    "text": "빈 좌석에 작은 아이가 앉아 있다. 목에 건 이름표에는 글자를 긁어낸 자국만 남았다. 아이는 자신을 부르던 목소리는 기억하지만, 그 목소리가 누구의 것인지 모른다. “이름이 없으면 열차에서 내릴 수 없대요.”",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "어떤 이름으로 불리고 싶은지 묻는다",
        "result": {
          "text": "아이는 한참 생각하다가 아직 모르겠다고 답한다. 당신은 빈 이름표 뒷면에 작은 별을 그려 주고, 다시 만나면 함께 생각하자고 한다.",
          "setFlags": [
            "side_child_open1"
          ]
        }
      },
      {
        "text": "안내소에 도움을 요청한다",
        "result": {
          "text": "당신은 아이를 안내소에 데려다 준다. 담당자는 임시 승객증을 발급해 주고 아이에게 따뜻한 담요를 건넨다.",
          "setFlags": [
            "side_child_left1"
          ]
        }
      }
    ]
  },
  {
    "id": "side_child_2",
    "kind": "event",
    "title": "대신 적힌 이름",
    "text": "아이가 승객 명부를 들고 찾아온다. 사라진 이름이 있던 자리에 다른 아이의 이름이 빼곡히 적혀 있다. “이걸 제 이름으로 쓰면, 그 아이는 어디로 가요?” 명부 끝에는 빈 줄도 하나 남아 있다.",
    "minAct": 2,
    "weight": 18,
    "choices": [
      {
        "text": "빈 줄을 남겨 두고 함께 방법을 찾는다",
        "result": {
          "text": "아이는 남의 이름이 적힌 줄을 조심스레 덮는다. 당신은 빈 줄도 승객의 자리일 수 있다는 사실을 확인한다.",
          "setFlags": [
            "side_child_open2"
          ]
        }
      },
      {
        "text": "임시 이름표로 여행할 수 있게 돕는다",
        "result": {
          "text": "당신은 임시 승객증의 유효 기간을 확인한다. 아이는 급하게 이름을 고르지 않아도 된다는 말에 안도한다.",
          "setFlags": [
            "side_child_left2"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_child_open1"
    ]
  },
  {
    "id": "side_child_3",
    "kind": "event",
    "title": "스스로 고른 이름",
    "text": "다음 역 안내판이 켜지자 아이가 찾아온다. “생각해 봤는데, 저는 별이 좋아요. 제 이름을 별이라고 쓰면 안 돼요?” 아이는 연필을 들고 기다린다. 오래된 명부는 여전히 누군가의 허가를 요구하고 있다.",
    "minAct": 3,
    "weight": 18,
    "choices": [
      {
        "text": "아이에게 연필을 건넨다",
        "result": {
          "text": "아이가 직접 별이라고 적자 빈 줄에 승차 도장이 찍힌다. 아이는 기뻐하며 자신의 이름을 몇 번이고 불러 본다.",
          "setFlags": [
            "side_child_named"
          ],
          "reward": {
            "mp": 5
          }
        }
      },
      {
        "text": "이름을 더 생각해도 된다고 말한다",
        "result": {
          "text": "아이는 이름표를 주머니에 넣고 웃는다. “그럼 별은 오늘만 제 이름으로 할래요.” 안내판에 임시 승객도 내릴 수 있다는 문구가 떠오른다.",
          "setFlags": [
            "side_child_wait"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_child_open2"
    ]
  },
  {
    "id": "side_postman_1",
    "kind": "event",
    "title": "도착지 없는 우편물",
    "text": "우편 가방을 멘 노인이 편지를 분류한다. 봉투마다 같은 고향의 주소가 적혀 있지만 지도에는 그 세계가 없다. 그는 마지막 발송일 이후 한 통도 배달하지 못했다고 한다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "편지의 주소를 함께 조사한다",
        "result": {
          "text": "노인은 가장 오래된 봉투를 펼쳐 보여 준다. 반송 도장 아래에는 다른 세계의 중계국 번호가 남아 있다.",
          "setFlags": [
            "side_postman_open1"
          ]
        }
      },
      {
        "text": "우체부에게 쉬어 갈 자리를 내준다",
        "result": {
          "text": "노인은 가방을 잠시 내려놓는다. 당신이 건넨 물을 마시고 다시 우편물을 정리하기 시작한다.",
          "setFlags": [
            "side_postman_left1"
          ]
        }
      }
    ]
  },
  {
    "id": "side_postman_2",
    "kind": "event",
    "title": "반송 도장의 의미",
    "text": "중계국에서 돌아온 노인이 떨리는 손으로 우편 기록을 펼친다. 고향은 돌아올 수 없는 곳이 되었지만 다른 세계로 떠난 주민들의 주소는 일부 남아 있다. 그는 편지를 보내도 될지 망설인다. “이 편지를 읽으면 또 슬퍼할 텐데요.”",
    "minAct": 2,
    "weight": 18,
    "choices": [
      {
        "text": "받을지 말지는 수신자에게 맡기자고 한다",
        "result": {
          "text": "노인은 편지 내용을 공개하지 않고 수신 의사를 먼저 묻기로 한다. 새로운 주소들이 가방의 빈 칸을 채운다.",
          "setFlags": [
            "side_postman_open2"
          ]
        }
      },
      {
        "text": "편지를 봉인해 기록관에 보관하도록 돕는다",
        "result": {
          "text": "노인은 편지에 손을 대지 않은 채 보관 신청서를 작성한다. 누군가 직접 찾으러 오는 날까지 기다리기로 한다.",
          "setFlags": [
            "side_postman_left2"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_postman_open1"
    ]
  },
  {
    "id": "side_postman_3",
    "kind": "event",
    "title": "마지막 배달",
    "text": "노인이 빈 가방을 들고 나타난다. 대부분의 수신자는 편지를 받기로 했지만, 하나는 끝내 응답이 없었다. 봉투에는 노인 자신의 이름이 적혀 있다. “나한테 온 것도 배달해야 하나 봅니다.”",
    "minAct": 3,
    "weight": 18,
    "choices": [
      {
        "text": "그가 직접 자신의 편지를 열도록 기다린다",
        "result": {
          "text": "노인은 오래전 동료가 쓴 안부를 읽는다. 편지를 접은 뒤 가방에 퇴근 표지를 단다. “오늘은 여기까지 해야겠군요.”",
          "setFlags": [
            "side_postman_delivered"
          ],
          "reward": {
            "mp": 6
          }
        }
      },
      {
        "text": "열지 않고 간직할 수 있다고 말한다",
        "result": {
          "text": "노인은 봉투를 안주머니에 넣는다. “언젠가 읽겠지요. 오늘은 이걸로 충분합니다.”",
          "setFlags": [
            "side_postman_kept"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_postman_open2"
    ]
  },
  {
    "id": "side_widow_1",
    "kind": "event",
    "title": "같은 역을 기다리는 사람",
    "text": "창가의 중년 여인은 매번 같은 역에서 내리려다 다시 앉는다. 그녀는 오래전 함께 여행하던 사람이 그 역에서 자신을 기다린다고 말한다. 하지만 차표에 적힌 도착일은 수십 년 전이다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "무엇을 기다리는지 듣는다",
        "result": {
          "text": "여인은 그날의 풍경을 이야기한다. 당신은 그녀가 기억하는 역과 실제 노선이 어디서 달라졌는지 찾아보기로 한다.",
          "setFlags": [
            "side_widow_open1"
          ]
        }
      },
      {
        "text": "그녀의 기다림을 존중하고 떠난다",
        "result": {
          "text": "여인은 차표를 다시 접는다. 당신에게 고개를 숙이고 창밖을 바라본다.",
          "setFlags": [
            "side_widow_left1"
          ]
        }
      }
    ]
  },
  {
    "id": "side_widow_2",
    "kind": "event",
    "title": "두 장의 시간표",
    "text": "여인은 당신이 찾은 낡은 시간표와 현재의 노선을 나란히 놓는다. 그녀가 기다리는 역은 이제 정차하지 않지만, 그곳의 풍경을 담은 기록은 남아 있다. “돌아갈 수 없다면, 내가 기다린 시간은 아무것도 아니게 되나요?”",
    "minAct": 2,
    "weight": 18,
    "choices": [
      {
        "text": "기다린 시간도 그녀의 삶이라고 말한다",
        "result": {
          "text": "여인은 시간표를 한 번 더 읽는다. 기록을 볼 수 있는 객차에 가 보기로 하고, 오래된 차표를 주머니에 넣는다.",
          "setFlags": [
            "side_widow_open2"
          ]
        }
      },
      {
        "text": "기록을 건네고 선택할 시간을 준다",
        "result": {
          "text": "여인은 시간표를 받아 든다. 지금 결정을 내리지 않아도 된다는 말에 조금 편안해 보인다.",
          "setFlags": [
            "side_widow_left2"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_widow_open1"
    ]
  },
  {
    "id": "side_widow_3",
    "kind": "event",
    "title": "다음 역의 차표",
    "text": "기록관에서 나온 여인은 오래된 차표와 빈 차표를 내민다. “그 사람을 잊고 싶은 건 아니에요. 그렇다고 남은 날도 모두 같은 역에서 보내야 할까요?” 그녀는 빈 차표에 손을 얹는다.",
    "minAct": 3,
    "weight": 18,
    "choices": [
      {
        "text": "새로운 목적지를 적을 자리를 내준다",
        "result": {
          "text": "여인은 바다가 보이는 역을 고른다. 오래된 차표는 새 차표와 함께 지갑에 넣는다.",
          "setFlags": [
            "side_widow_departed"
          ],
          "reward": {
            "mp": 5
          }
        }
      },
      {
        "text": "준비될 때까지 열차에 남아도 좋다고 말한다",
        "result": {
          "text": "여인은 빈 차표를 받아 든다. 이번에는 같은 역을 확인하는 대신 식당칸으로 걸어간다.",
          "setFlags": [
            "side_widow_stayed"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_widow_open2"
    ]
  },
  {
    "id": "side_author_1",
    "kind": "event",
    "title": "지워진 마을",
    "text": "원고를 들고 있는 작가가 같은 문장을 거듭 고친다. 창밖에는 그의 원고 속 마을이 나타났다 사라진다. 그는 더 나은 결말을 써 주려 했을 뿐이라지만, 수정할 때마다 마을 사람들은 전날의 기억을 잃는다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "마을 사람들의 이야기를 먼저 듣자고 한다",
        "result": {
          "text": "작가는 펜을 내려놓고 원고를 닫는다. 한 번 더 고치기 전에 등장인물의 말을 기록해 보기로 한다.",
          "setFlags": [
            "side_author_open1"
          ]
        }
      },
      {
        "text": "원고를 덮고 수정부터 멈추도록 권한다",
        "result": {
          "text": "작가는 더 이상 수정하지 않겠다고 약속한다. 창밖의 마을은 당분간 같은 모습을 유지한다.",
          "setFlags": [
            "side_author_left1"
          ]
        }
      }
    ]
  },
  {
    "id": "side_author_2",
    "kind": "event",
    "title": "마을에서 온 의견서",
    "text": "작가가 마을 사람들의 의견을 베껴 온 종이를 보여 준다. 모두가 행복한 결말을 원하지는 않았다. 누군가는 떠나고 싶고, 누군가는 망한 가게를 다시 열고 싶다고 적었다. “그럼 나는 무엇을 써야 하죠?”",
    "minAct": 2,
    "weight": 18,
    "choices": [
      {
        "text": "서로 다른 미래를 선택할 수 있게 하자고 한다",
        "result": {
          "text": "작가는 결말 대신 마을의 길을 그린다. 주민들이 선택할 수 있는 문을 하나씩 남기기로 한다.",
          "setFlags": [
            "side_author_open2"
          ]
        }
      },
      {
        "text": "지금의 마을을 보존하고 더는 손대지 말자고 한다",
        "result": {
          "text": "작가는 수정 전 원고를 따로 봉인한다. 주민들의 기억이 더 이상 바뀌지 않게 한다.",
          "setFlags": [
            "side_author_left2"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_author_open1"
    ]
  },
  {
    "id": "side_author_3",
    "kind": "event",
    "title": "작가의 마지막 문장",
    "text": "작가는 마지막 페이지를 보여 준다. 마을의 미래를 하나로 정하면 이야기는 깔끔해진다. 그러나 문을 열어 둔다면 자신도 앞으로 무슨 일이 일어날지 알 수 없다. 그는 펜을 내민다. “이번엔 내가 아닌 그들에게 물어볼까요?”",
    "minAct": 3,
    "weight": 18,
    "choices": [
      {
        "text": "주민들이 각자의 결말을 쓰게 한다",
        "result": {
          "text": "작가는 마지막 문장을 비워 둔다. 창밖의 마을에서 서로 다른 방향으로 길을 나서는 사람들이 보인다.",
          "setFlags": [
            "side_author_freed"
          ],
          "reward": {
            "mp": 6
          }
        }
      },
      {
        "text": "현재의 마을을 보존하고 작가의 개입을 끝낸다",
        "result": {
          "text": "작가는 더 이상의 개작을 하지 않기로 한다. 마지막 페이지에 오늘의 날짜를 적고 책을 닫는다.",
          "setFlags": [
            "side_author_closed"
          ]
        }
      }
    ],
    "requiresAll": [
      "side_author_open2"
    ]
  },
  {
    "id": "side_rain",
    "kind": "event",
    "title": "비를 보관하는 병",
    "text": "유리병 안에서 비가 내리고 있다. 병을 든 여행자는 가뭄이 든 고향에서 가져온 마지막 비라고 설명한다. 그러나 병을 열면 고향으로 가져갈 수 없고, 눈앞의 말라 가는 작은 화분은 오늘을 넘기기 어렵다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "여행자에게 화분과 비를 나눌 방법을 묻는다",
        "result": {
          "text": "그는 병의 물방울 몇 개를 화분에 떨어뜨린다. 남은 비는 여전히 유리 안에서 내린다.",
          "setFlags": [
            "side_rain_shared"
          ]
        }
      },
      {
        "text": "고향에 가져갈 비를 지키도록 돕는다",
        "result": {
          "text": "당신은 병마개를 다시 고정한다. 여행자는 화분을 물이 있는 식당칸으로 옮기겠다고 한다.",
          "setFlags": [
            "side_rain_saved"
          ]
        }
      }
    ]
  },
  {
    "id": "side_portrait",
    "kind": "event",
    "title": "초상화의 뒷면",
    "text": "액자 속의 가족 사진에서 한 사람의 얼굴만 비어 있다. 그림을 들고 온 승객은 얼굴을 그려 달라고 부탁한다. 그는 기억이 나지 않아도 가족이 완전해 보였으면 좋겠다고 말한다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "기억하지 못하는 얼굴은 빈 채로 두자고 한다",
        "result": {
          "text": "승객은 빈자리를 손가락으로 쓰다듬는다. 대신 뒷면에 가족과 지냈던 하루를 적는다.",
          "setFlags": [
            "side_portrait_blank"
          ]
        }
      },
      {
        "text": "승객이 기억하는 작은 특징만 함께 그린다",
        "result": {
          "text": "승객은 웃을 때 생기던 주름 하나를 그린다. 나머지는 상상하지 않기로 한다.",
          "setFlags": [
            "side_portrait_drawn"
          ]
        }
      }
    ]
  },
  {
    "id": "side_clock",
    "kind": "event",
    "title": "빌린 하루",
    "text": "한 승객이 낡은 시계를 건넨다. 시계를 돌리면 하루를 되돌릴 수 있지만 대신 내일의 한 시간을 잃는다고 한다. 그는 오래전 다투었던 친구에게 사과할 기회를 찾고 있다.",
    "minAct": 2,
    "weight": 8,
    "choices": [
      {
        "text": "지금 할 수 있는 사과부터 권한다",
        "result": {
          "text": "승객은 시계를 돌리지 않고 편지를 쓴다. 내일 그 친구를 찾아가기로 한다.",
          "setFlags": [
            "side_clock_now"
          ]
        }
      },
      {
        "text": "대가를 알고도 선택한다면 지켜본다",
        "result": {
          "text": "승객은 대가를 확인한 뒤 시계를 돌린다. 다시 만날 수 있을지는 모르지만 그 결정은 자신의 것이라고 말한다.",
          "setFlags": [
            "side_clock_rewind"
          ]
        }
      }
    ]
  },
  {
    "id": "side_seed",
    "kind": "event",
    "title": "주머니 속의 숲",
    "text": "작은 종이봉투에 씨앗을 담은 승객이 있다. 멸망한 숲에서 가져온 씨앗인데, 어느 세계의 흙에서 자랄지 아무도 모른다. 열차의 화분 하나가 비어 있다.",
    "minAct": 1,
    "weight": 8,
    "choices": [
      {
        "text": "한 알만 시험 삼아 심는다",
        "result": {
          "text": "승객은 가장 작은 씨앗을 골라 흙에 묻는다. 이름표에는 숲의 이름을 적고 나머지 씨앗을 챙긴다.",
          "setFlags": [
            "side_seed_planted"
          ]
        }
      },
      {
        "text": "적합한 흙을 찾을 때까지 간직한다",
        "result": {
          "text": "승객은 습기를 피해 봉투를 새로 접는다. 서두르지 않고 숲이 살 곳을 찾겠다고 한다.",
          "setFlags": [
            "side_seed_carried"
          ]
        }
      }
    ]
  },
  {
    "id": "side_song",
    "kind": "event",
    "title": "마지막 음표",
    "text": "빈 객차에서 오래된 노래가 흘러나온다. 음악가는 마지막 한 음을 기억하지 못해 같은 곡을 반복하고 있다. 그는 고향의 노래를 함부로 바꾸고 싶지 않다고 말한다.",
    "minAct": 2,
    "weight": 8,
    "choices": [
      {
        "text": "마지막에 침묵을 남겨 두자고 한다",
        "result": {
          "text": "음악가는 마지막 마디에서 손을 멈춘다. 침묵 뒤에 처음으로 박수가 들린다.",
          "setFlags": [
            "side_song_silence"
          ]
        }
      },
      {
        "text": "새로운 음을 붙이되 원곡과 구분한다",
        "result": {
          "text": "음악가는 자신이 만든 음에 작은 별표를 붙인다. 오늘의 노래라는 제목을 따로 적는다.",
          "setFlags": [
            "side_song_new"
          ]
        }
      }
    ]
  },
  {
    "id": "side_bridge",
    "kind": "event",
    "title": "다리의 통행료",
    "text": "책 속 강을 건너는 다리에는 동전 대신 기억을 요구하는 표지판이 걸려 있다. 한 여행자가 어린 시절의 즐거운 기억 하나를 지불하려 한다. 강 위로 느리지만 무료인 나룻배도 보인다.",
    "minAct": 2,
    "weight": 8,
    "choices": [
      {
        "text": "함께 나룻배를 기다린다",
        "result": {
          "text": "나룻배는 늦게 도착했지만 기억을 내놓을 필요는 없었다. 여행자는 배에 올라 어린 시절의 이야기를 들려준다.",
          "setFlags": [
            "side_bridge_boat"
          ]
        }
      },
      {
        "text": "대가를 확인하고 여행자의 결정을 존중한다",
        "result": {
          "text": "그는 스스로 고른 기억을 내놓는다. 잃어버린 기억의 제목만 수첩에 적은 뒤 다리를 건넌다.",
          "setFlags": [
            "side_bridge_paid"
          ]
        }
      }
    ]
  },
  {
    "id": "side_museum",
    "kind": "event",
    "title": "아무도 오지 않는 전시관",
    "text": "어느 객차 전체가 사라진 도시의 작은 박물관이다. 관리인은 마지막 관람객이 떠난 뒤에도 매일 표를 정리해 왔다. 그는 전시품을 나누어 줄지, 박물관을 계속 지킬지 고민한다.",
    "minAct": 3,
    "weight": 8,
    "choices": [
      {
        "text": "전시품의 기록을 남기고 필요한 이에게 보내자고 한다",
        "result": {
          "text": "관리인은 목록과 출처를 기록한다. 첫 번째 물건을 그 도시에서 살았던 사람에게 보내기로 한다.",
          "setFlags": [
            "side_museum_recorded"
          ]
        }
      },
      {
        "text": "작은 박물관을 지킬 방법을 함께 찾는다",
        "result": {
          "text": "관리인은 예약 관람 안내를 붙인다. 매일 문을 열지 않아도 기억을 지킬 수 있게 됐다.",
          "setFlags": [
            "side_museum_kept"
          ]
        }
      }
    ]
  },
  {
    "id": "side_mirror",
    "kind": "event",
    "title": "거울 속의 다른 선택",
    "text": "거울에는 당신 대신 한 승객의 다른 삶이 비친다. 그는 현실에서 포기한 길을 거울 속 자신이 걷고 있다는 사실을 알고 있다. 거울을 깨면 그 모습은 더 이상 볼 수 없고, 가지고 있으면 계속 비교하며 살아가야 한다.",
    "minAct": 3,
    "weight": 8,
    "choices": [
      {
        "text": "거울을 천으로 덮고 필요할 때만 보자고 한다",
        "result": {
          "text": "승객은 천을 덮고 오늘의 일정을 적는다. 더 이상 하루 종일 거울 앞에 서 있을 필요는 없다.",
          "setFlags": [
            "side_mirror_covered"
          ]
        }
      },
      {
        "text": "거울을 보관함에 맡길 수 있게 돕는다",
        "result": {
          "text": "승객은 보관표를 받아 든다. 다시 보고 싶어지면 돌아올 수 있지만 오늘은 자신의 길을 걷겠다고 한다.",
          "setFlags": [
            "side_mirror_left"
          ]
        }
      }
    ]
  }
];

export const SIDE_STORIES = [
  {
    "id": "child",
    "title": "이름을 잃은 아이",
    "stages": [
      "side_child_1",
      "side_child_2",
      "side_child_3"
    ],
    "echoFlags": [
      "side_child_wait",
      "side_child_named",
      "side_child_left2",
      "side_child_open2",
      "side_child_left1",
      "side_child_open1"
    ]
  },
  {
    "id": "postman",
    "title": "마지막 우체부",
    "stages": [
      "side_postman_1",
      "side_postman_2",
      "side_postman_3"
    ],
    "echoFlags": [
      "side_postman_kept",
      "side_postman_delivered",
      "side_postman_left2",
      "side_postman_open2",
      "side_postman_left1",
      "side_postman_open1"
    ]
  },
  {
    "id": "widow",
    "title": "내리지 않는 승객",
    "stages": [
      "side_widow_1",
      "side_widow_2",
      "side_widow_3"
    ],
    "echoFlags": [
      "side_widow_stayed",
      "side_widow_departed",
      "side_widow_left2",
      "side_widow_open2",
      "side_widow_left1",
      "side_widow_open1"
    ]
  },
  {
    "id": "author",
    "title": "끝을 고치려는 작가",
    "stages": [
      "side_author_1",
      "side_author_2",
      "side_author_3"
    ],
    "echoFlags": [
      "side_author_closed",
      "side_author_freed",
      "side_author_left2",
      "side_author_open2",
      "side_author_left1",
      "side_author_open1"
    ]
  },
  {
    "id": "rain",
    "title": "비를 보관하는 병",
    "stages": [
      "side_rain"
    ],
    "echoFlags": [
      "side_rain_saved",
      "side_rain_shared"
    ]
  },
  {
    "id": "portrait",
    "title": "초상화의 뒷면",
    "stages": [
      "side_portrait"
    ],
    "echoFlags": [
      "side_portrait_drawn",
      "side_portrait_blank"
    ]
  },
  {
    "id": "clock",
    "title": "빌린 하루",
    "stages": [
      "side_clock"
    ],
    "echoFlags": [
      "side_clock_rewind",
      "side_clock_now"
    ]
  },
  {
    "id": "seed",
    "title": "주머니 속의 숲",
    "stages": [
      "side_seed"
    ],
    "echoFlags": [
      "side_seed_carried",
      "side_seed_planted"
    ]
  },
  {
    "id": "song",
    "title": "마지막 음표",
    "stages": [
      "side_song"
    ],
    "echoFlags": [
      "side_song_new",
      "side_song_silence"
    ]
  },
  {
    "id": "bridge",
    "title": "다리의 통행료",
    "stages": [
      "side_bridge"
    ],
    "echoFlags": [
      "side_bridge_paid",
      "side_bridge_boat"
    ]
  },
  {
    "id": "museum",
    "title": "아무도 오지 않는 전시관",
    "stages": [
      "side_museum"
    ],
    "echoFlags": [
      "side_museum_kept",
      "side_museum_recorded"
    ]
  },
  {
    "id": "mirror",
    "title": "거울 속의 다른 선택",
    "stages": [
      "side_mirror"
    ],
    "echoFlags": [
      "side_mirror_left",
      "side_mirror_covered"
    ]
  }
];

const ECHOES: Record<string, string> = {
  "side_child_left1": "이름표 없는 아이는 안내소에서 별 모양의 임시 승객증을 받았다.",
  "side_child_left2": "아이는 정해진 이름 없이도 여행할 수 있는 임시 승객증을 얻었다.",
  "side_child_named": "별이라는 이름을 고른 아이는 자기 손으로 차표를 완성했다.",
  "side_child_wait": "아이는 어떤 이름으로 살아갈지 서두르지 않기로 했다.",
  "side_postman_left1": "마지막 우체부는 긴 배달길에서 한 차례 숨을 돌렸다.",
  "side_postman_left2": "고향에 닿지 못한 편지는 수신자가 찾아올 때까지 봉인된 채 보관되었다.",
  "side_postman_delivered": "마지막 우체부는 자신의 편지까지 배달하고 마침내 가방을 내려놓았다.",
  "side_postman_kept": "마지막 우체부는 마지막 편지를 자신이 읽고 싶은 날까지 간직했다.",
  "side_widow_left1": "창가의 승객은 자신의 차표를 접어 둔 채 기다림을 이어 갔다.",
  "side_widow_left2": "창가의 승객은 두 장의 시간표를 간직하고 자신의 다음 걸음을 생각하기로 했다.",
  "side_widow_departed": "창가의 승객은 지난 약속을 간직한 채 바다가 보이는 역으로 향했다.",
  "side_widow_stayed": "창가의 승객은 아직 내리지 않았지만, 처음으로 다른 객차를 찾아갔다.",
  "side_author_left1": "원고 속 마을은 작가가 수정을 멈춘 뒤 한동안 같은 아침을 맞았다.",
  "side_author_left2": "원고 속 마을의 마지막 수정본은 봉인되었고, 주민들의 기억은 그날 이후 유지되었다.",
  "side_author_freed": "원고 속 마을 사람들은 자신들의 다음 문장을 직접 쓰기 시작했다.",
  "side_author_closed": "작가는 마을의 마지막 페이지에 날짜만 남기고 더 이상 운명을 고치지 않았다.",
  "side_rain_shared": "작은 화분에는 먼 세계의 비 몇 방울이 스며들었다.",
  "side_rain_saved": "여행자는 고향에 가져갈 마지막 비를 온전히 간직했다.",
  "side_portrait_blank": "얼굴이 비어 있는 가족사진 뒷면에는 잊지 못한 하루가 기록되었다.",
  "side_portrait_drawn": "가족사진의 빈 얼굴에는 기억해 낸 작은 웃음 주름만 남았다.",
  "side_clock_now": "하루를 빌리려던 승객은 오늘의 말로 사과할 편지를 썼다.",
  "side_clock_rewind": "하루를 빌린 승객은 내일의 한 시간을 내어 주었다.",
  "side_seed_planted": "사라진 숲의 이름을 단 작은 화분에 씨앗 한 알이 심겼다.",
  "side_seed_carried": "사라진 숲의 씨앗은 새로운 흙을 찾아 여행을 계속했다.",
  "side_song_silence": "잊힌 노래의 마지막 마디에는 조용한 쉼표가 남았다.",
  "side_song_new": "잊힌 노래 옆에는 음악가가 오늘 만든 새로운 선율이 기록되었다.",
  "side_bridge_boat": "기억을 지킨 여행자는 느린 나룻배로 강을 건넜다.",
  "side_bridge_paid": "다리를 건넌 여행자의 수첩에는 잃어버린 기억의 제목이 남았다.",
  "side_museum_recorded": "사라진 도시의 전시품은 출처를 적은 기록과 함께 새로운 손으로 건너갔다.",
  "side_museum_kept": "사라진 도시의 박물관은 예약한 방문객을 맞는 작은 공간으로 남았다.",
  "side_mirror_covered": "거울을 덮은 승객은 다른 가능성 대신 오늘 할 일을 적기 시작했다.",
  "side_mirror_left": "다른 삶을 비추던 거울은 승객이 다시 찾을 때까지 보관함에 놓였다.",
  "side_child_open1": "이름표 뒤에 그린 작은 별은 아이와의 미완의 약속으로 남았다.",
  "side_child_open2": "아이의 이름을 적을 빈 줄은 아직 남아 있었다.",
  "side_postman_open1": "마지막 우체부의 봉투에는 아직 확인할 주소가 남아 있었다.",
  "side_postman_open2": "우체부는 새로운 수신자들의 답을 기다리고 있었다.",
  "side_widow_open1": "창가의 승객이 기억하는 역은 아직 지도에서 찾지 못했다.",
  "side_widow_open2": "창가의 승객에게 오래된 시간표와 새로운 노선이 남았다.",
  "side_author_open1": "작가는 원고를 닫고 마을 사람들의 말을 듣기로 했다.",
  "side_author_open2": "작가는 하나의 결말 대신 여러 방향의 길을 그려 두었다."
};

/** One remembered line per story, favoring the latest choice over unfinished stages. */
export function sideStoryEchoes(flags: ReadonlySet<string>): string[] {
  return SIDE_STORIES.flatMap(story => {
    const flag = story.echoFlags.find(f => flags.has(f));
    return flag ? [ECHOES[flag]] : [];
  });
}
