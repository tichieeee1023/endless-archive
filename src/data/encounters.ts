import type { Encounter } from "../types/encounter";
import { MEMORY_ENCOUNTERS } from "./memories";

export const ENCOUNTERS: Encounter[] = [
  /* ============================================================
     라엘 체인 — 첫 조우는 조건 없이 랜덤 풀에
     ============================================================ */
  {
    id: "rael_encounter_1",
    npcId: "rael",
    kind: "npc",
    title: "복도 끝의 남자",
    minAct: 1,
    weight: 10,
    text:
      "객차와 객차 사이, 좁은 복도.\n" +
      "창밖에는 아무것도 없다. 그런데 남자는 계속 그 창을 보고 있다.\n\n" +
      "정장. 은색 회중시계. 초침이 거꾸로 돌고 있다.\n" +
      "그가 천천히 고개를 돌린다. 눈이 마주친다.\n\n" +
      "“……여기서 뭘 보고 있습니까.”\n" +
      "목소리에 온도가 없다. 사람이라기보다, 규칙에 가깝다.",
    choices: [
      {
        text: "옆에 서서, 같이 창밖을 본다",
        result: {
          text:
            "대답 대신 옆에 선다. 아무것도 없는 창을, 둘이서 본다.\n\n" +
            "한참 뒤 그가 낮게 말한다.\n" +
            "“……당신은, 여기서 뭘 보고 있습니까.”\n" +
            "같은 질문. 이번엔, 대답을 기다리는 질문이다.",
          affinity: 8,
        },
      },
      {
        text: "“무엇을 보고 계세요?”",
        check: { stat: "insight", base: 30, difficulty: 40 },
        result: {
          text:
            "그가 잠깐 웃는다. 처음 보는 표정이다.\n\n" +
            "“아무것도요. 그런데, 아무것도 아닌 게 보입니다.”\n" +
            "회중시계가 멈춘다. 그가 시계를 내려다본다. “……이상하군요.”",
          affinity: 15,
          setFlags: ["rael_first_smile"],
        },
        fail: {
          text:
            "“업무입니다.”\n" +
            "그는 다시 무표정으로 돌아간다. 창밖은 여전히 아무것도 없다.",
          affinity: 3,
        },
      },
      {
        text: "말없이 지나친다",
        result: {
          text:
            "그와 어깨를 스치고 지나친다.\n" +
            "뒤에서 목소리가 들린다. 아주 작게, 혼잣말처럼.\n" +
            "“……지나가시는군요.”\n" +
            "돌아보면, 그는 이미 창밖을 보고 있다.",
          affinity: -2,
        },
      },
    ],
  },

  {
    id: "rael_encounter_2",
    npcId: "rael",
    kind: "chain",
    title: "손목의 흉터",
    minAct: 1,
    requiresAll: ["bond_rael_1"],
    weight: 20,
    text:
      "열차가 크게 흔들린다. 복도에서 균형을 잃고, 누군가와 부딪친다.\n\n" +
      "라엘이다. 그가 당신을 붙잡는다. 반사적이고, 정확한 손.\n" +
      "그 순간 소매가 걷혔다.\n\n" +
      "손목 안쪽에, 낡은 상처가 있다.\n" +
      "글자처럼 보인다. 아주 오래된, 지워지지 않은 글자.",
    choices: [
      {
        text: "손목을 잡는다",
        check: { stat: "charm", base: 20, difficulty: 50 },
        result: {
          text:
            "손목을 잡는다. 그가 굳는다.\n\n" +
            "“……놓아주십시오.”\n" +
            "그런데 힘을 주지 않는다. 뺄 수 있는데, 빼지 않는다.\n\n" +
            "“이건, 제가 쓰인 흔적입니다.”\n" +
            "처음으로, 그의 목소리에 틈이 생긴다.",
          affinity: 20,
          setFlags: ["rael_saw_scar"],
        },
        fail: {
          text:
            "손목을 잡으려는 순간, 그가 먼저 손을 뺀다.\n\n" +
            "“부탁드립니다. 이건 건드리지 마세요.”\n" +
            "그의 목소리가 아주 단호하다. 처음 듣는 단호함이다.",
          affinity: -5,
        },
      },
      {
        text: "모른 척, 소매를 여며준다",
        result: {
          text:
            "아무것도 본 적 없다는 얼굴로, 소매를 여며준다.\n\n" +
            "그가 잠깐 당신을 본다. 어떤 표정인지, 읽을 수 없다.\n" +
            "“……감사합니다.”\n" +
            "그 말에, 아주 작게 안도가 섞여 있다.",
          affinity: 5,
          setFlags: ["rael_noticed_scar"],
        },
      },
      {
        text: "“글자 같아요.”",
        check: { stat: "insight", base: 40, difficulty: 45 },
        result: {
          text:
            "“글자 같아요.”\n\n" +
            "그의 눈이 흔들린다. 회중시계가, 이번엔 빠르게 돌기 시작한다.\n\n" +
            "“……당신은. 정말, 읽는군요.”\n" +
            "그가 손목을 감싼다. 숨기는 게 아니라, 확인하듯이.",
          affinity: 15,
          setFlags: ["rael_saw_scar"],
        },
        fail: {
          text:
            "“착각입니다.”\n" +
            "그는 소매를 내린다. 대화는 거기서 끝난다.",
          affinity: 0,
        },
      },
    ],
  },

  {
    id: "rael_encounter_3",
    npcId: "rael",
    kind: "chain",
    title: "기관실의 문",
    minAct: 2,
    requiresAll: ["bond_rael_2"],
    weight: 30,
    text:
      "열차의 맨 앞. 기관실 문 앞에 라엘이 서 있다.\n" +
      "문은 무겁고, 낡았고, 열려 있지 않다.\n\n" +
      "“이 문 안에, 열차의 목적지가 있습니다.”\n" +
      "그가 당신을 본다. 처음으로, 정면으로.\n\n" +
      "“저는 이 문을 열 수 없습니다. …당신은 열 수 있습니다.”\n\n" +
      "문 너머에서, 무언가가 당신의 이름을 부른다.\n" +
      "라엘의 목소리로.",
    choices: [
      {
        text: "문을 연다",
        check: { stat: "will", base: 30, difficulty: 55 },
        result: {
          text:
            "문을 민다. 무겁게, 천천히 열린다.\n\n" +
            "문 너머에, 라엘이 있다.\n" +
            "지금의 라엘과 똑같은 얼굴로. 수백 개의 라엘이.\n\n" +
            "“……저는 열차의 부품입니다.”\n" +
            "수백 개의 입이 동시에 말한다.\n" +
            "“이 열차가 멈추지 않는 이유는, 제가 계속 다시 쓰이기 때문입니다.”\n\n" +
            "가장 앞의 라엘이 손을 내민다.\n" +
            "“당신이 이 문을 열어준다면. 저는 처음으로 — 멈출 수 있습니다.”",
          affinity: 25,
          setFlags: ["rael_truth"],
          nextId: "rael_final",
        },
        fail: {
          text:
            "문이 열리지 않는다. 손잡이가 차갑다. 너무 차가워서, 손을 뗀다.\n\n" +
            "“……아직, 준비가 되지 않았군요.”\n" +
            "그가 낮게 웃는다. 실망인지 안도인지, 알 수 없다.",
          affinity: 5,
        },
      },
      {
        text: "문 대신, 그에게 손을 내민다",
        check: { stat: "charm", base: 40, difficulty: 40 },
        result: {
          text:
            "문을 등지고, 그에게 손을 내민다.\n\n" +
            "라엘이 굳는다. 회중시계가, 멈춘다.\n\n" +
            "“……규칙은, 지켜져야 합니다.”\n" +
            "“규칙은 여기 없어요.”\n\n" +
            "아주 오랜 침묵 끝에, 그가 손을 잡는다.\n" +
            "그의 손이, 아주 조금 떨린다.\n" +
            "“……규칙은, 지켜지지 않아도 되는군요.”",
          affinity: 30,
          setFlags: ["rael_hand"],
          nextId: "rael_final",
        },
        fail: {
          text:
            "그가 손을 뒤로 숨긴다.\n\n" +
            "“규칙은 지켜져야 합니다.”\n" +
            "목소리가 다시, 규칙처럼 차갑다.",
          affinity: -3,
        },
      },
      {
        text: "뒤돌아 나간다",
        result: {
          text:
            "아무 말 없이 뒤돌아 나간다.\n\n" +
            "문이 저절로 닫힌다. 등 뒤에서, 아주 작게 웃는 소리가 들린다.\n" +
            "웃음인지, 아닌지. 끝까지 알 수 없다.",
          affinity: -15,
          setFlags: ["rael_abandoned"],
        },
      },
    ],
  },

  {
    id: "rael_final",
    npcId: "rael",
    kind: "chain",
    title: "결말",
    requiresAll: ["rael_truth"],
    weight: 0,   // nextId로만 진입, 랜덤 풀엔 안 뜸
    once: true,
    text: "라엘이 규칙을 어긴다. 처음으로, 스스로.",
    choices: [
      {
        text: "옆자리에 앉는다",
        result: {
          text: "열차가 조금 느려진다. 두 사람의 무게만큼.",
          affinity: 5,
          setFlags: ["rael_end_confirmed"],
        },
      },
    ],
  },

  {
    id: "seon_1", npcId: "seon", kind: "npc", title: "검을 닦는 밤", minAct: 1, weight: 10,
    text: "객차 구석. 세온이 홀로 앉아 검을 닦고 있다.\n검에는 금이 가 있다. 세계가 멸망할 때 생긴 자국이라고 했다.",
    choices: [
      { text: "옆에 앉아 검을 본다", result: { text: "그가 잠깐 손을 멈춘다. \"…이거, 흉하다고 생각하지.\"\n\"나도 그렇게 생각해. 근데 이거 없이는, 아무것도 못 지켰어.\"", affinity: 8 } },
      { text: "\"왜 그 검을 아직도 쓰세요?\" 묻는다", check: { stat: "charm", base: 20, difficulty: 40 }, result: { text: "그가 대답 대신 검을 내려놓는다. \"버리면, 지켰던 것도 잊을 것 같아서.\"\n그의 목소리가 아주 낮다. \"…안 잊고 싶은 게 있어.\"", affinity: 15, setFlags: ["seon_shared_name"] }, fail: { text: "\"신경 쓸 일 아니야.\" 그는 다시 검을 닦는다.", affinity: 2 } },
      { text: "말없이 지나친다", result: { text: "그는 끝까지 고개를 들지 않는다.", affinity: -2 } },
    ],
  },
  {
    id: "seon_2", npcId: "seon", kind: "chain", title: "멸망한 세계의 이름", minAct: 2, requiresAll: ["bond_seon_1"], weight: 20,
    text: "세온이 창밖을 본다. 이번엔 아무것도 없는 창이 아니다.\n그의 세계가, 아주 잠깐 비친다. 재와 잿더미. 그 위로 검은 하늘.\n\"…'아르겐'이라고 불렀어. 내가 지켰던 곳.\"",
    choices: [
      { text: "\"이야기를 들려주세요\"", check: { stat: "insight", base: 30, difficulty: 45 }, result: { text: "그가 아주 오래, 천천히 말한다. 광장, 종탑, 왕의 마지막 명령.\n끝에 그가 웃는다. 우는 것처럼. \"이렇게 말해본 게 처음이야. …고마워.\"", affinity: 20, setFlags: ["seon_world_name"] }, fail: { text: "\"…별거 아니야.\" 그는 다시 입을 닫는다.", affinity: 3 } },
      { text: "손을 잡는다", check: { stat: "charm", base: 30, difficulty: 50 }, result: { text: "그가 손을 뺄 뻔하다가, 멈춘다. 그리고 아주 약하게 마주 잡는다.\n\"이거, 이상한데. …안 이상해.\"", affinity: 18, setFlags: ["seon_world_name"] }, fail: { text: "그가 손을 피한다. \"…미안. 아직, 그런 거엔 익숙하지 않아.\"", affinity: -3 } },
      { text: "\"돌아갈 수 있어요?\"", result: { text: "그가 아주 오래 침묵한다. \"돌아간다면, 네가 없겠지.\"\n\"그건, 생각보다 싫은 일이야.\"", affinity: 12, setFlags: ["seon_world_name"] } },
    ],
  },
  {
    id: "seon_3", npcId: "seon", kind: "chain", title: "마지막 기사", minAct: 3, requiresAll: ["bond_seon_2"], weight: 30,
    text: "열차가 멈추지 않는다. 세온이 검을 들고 마지막 객차에 선다.\n\"열차를 멈추려면, 누군가 기관실을 열어야 해. …내 세계를 되살릴 방법도, 거기 있어.\"\n그가 당신을 본다. \"나는, 아르겐으로 돌아갈 수 있어. 돌아가면 — 이 열차는 멈출 거야.\"\n\"내 세계는 되살아나고, 너는 열차에 남아. 혹은 반대거나.\"",
    choices: [
      { text: "\"당신은 돌아가세요. 저는 열차에 남을게요.\"", check: { stat: "will", base: 20, difficulty: 55 }, result: { text: "그가 웃는다. 아주 오랜만에, 아주 자연스럽게.\n\"그런 말, 하지 마. …내가 그걸 어떻게 듣고 가.\"\n그가 검을 내려놓는다. \"아르겐은, 이제 과거야. 내 현재는 — 여기 있어.\"", affinity: 25, setFlags: ["seon_saved_world", "seon_stayed"], nextId: "seon_final_choice" }, fail: { text: "그가 고개를 젓는다. \"그렇게 말할 줄 알았어. 그래서, 더 못 가겠어.\"", affinity: 10 } },
      { text: "\"같이 가요. 당신의 세계로.\"", check: { stat: "resonance", base: 30, difficulty: 55 }, result: { text: "그가 한참 동안 말이 없다. \"…그 세계는, 죽었어. 그래도 괜찮겠어?\"\n당신이 고개를 끄덕이자, 그가 아주 조용히 웃는다.\n\"그럼, 같이 가자. 내가 지켰던 곳을, 이번엔 너에게 보여줄게.\"", affinity: 30, setFlags: ["seon_saved_world", "seon_travel_world"], nextId: "seon_final_choice" }, fail: { text: "\"…아니야. 그건 너무 무거워.\" 그가 시선을 돌린다.", affinity: 5 } },
      { text: "\"당신 혼자 결정하세요\"", result: { text: "그가 아주 오래, 아주 천천히 고개를 끄덕인다.\n\"…알겠어. 내가, 결정할게.\"", affinity: -10, setFlags: ["seon_abandoned"] } },
    ],
  },
  { id: "seon_final_choice", npcId: "seon", kind: "chain", title: "결말", weight: 0, text: "세온이 검을 든다. \"…같이 가자.\"", choices: [
    { text: "손을 잡는다", result: { text: "그의 손이 따뜻하다.", affinity: 5, setFlags: ["seon_end_confirmed"] } },
  ] },
  {
    id: "kairu_1", npcId: "kairu", kind: "npc", title: "여백의 목소리", minAct: 1, weight: 10,
    text: "페이지와 페이지 사이, 아무것도 없는 여백.\n그 곳에서 목소리가 들린다. 아주 달콤하고, 아주 낯익은 목소리.\n\"…너는, 누구의 책을 읽고 있니?\"",
    choices: [
      { text: "\"당신은 누구세요?\"", result: { text: "여백이 살짝 접힌다. 웃는 것 같다.\n\"이름은 아직 없어. 너가 지어주면, 가질 수 있어.\"", affinity: 8, setFlags: ["kairu_heard_voice"] } },
      { text: "그 목소리의 정체를 꿰뚫어본다", check: { stat: "insight", base: 30, difficulty: 50 }, result: { text: "여백이 잠깐 떨린다. \"…너, 눈이 좋구나.\"\n여백 사이로, 아주 잠깐 손이 보인다. 문신이 빽빽한, 손.\n\"이름을 알면, 읽힌다는 거 알아? 그래서 이름이 없어.\"", affinity: 15, setFlags: ["kairu_heard_voice"] }, fail: { text: "여백이 닫힌다. \"너무 봤어. …다음에 보자.\"", affinity: 0 } },
      { text: "무시하고 지나친다", result: { text: "목소리가 아주 작게 웃는다. \"…도망치는구나.\"", affinity: -3 } },
    ],
  },
  {
    id: "kairu_2", npcId: "kairu", kind: "chain", title: "읽히지 않은 페이지", minAct: 2, requiresAll: ["bond_kairu_1"], weight: 20,
    text: "열차 창가. 카이루가 앉아 있다. 이번엔 여백이 아니라, 사람의 모습으로.\n손등의 문신이 아주 희미하게 빛난다.\n\"…놀라지 않네. 이렇게 보이는 건, 처음인데.\"",
    choices: [
      { text: "\"이름을 지어줄까요?\"", check: { stat: "charm", base: 20, difficulty: 55 }, result: { text: "그가 아주 잠깐, 진짜로 굳는다.\n\"…하지 마. 그건, 나를 이 세계에 묶는 일이야.\"\n그런데 그의 목소리가 아주 작게 떨린다. \"…근데, 이상하지. 싫지가 않아.\"", affinity: 20, setFlags: ["kairu_true_name"] }, fail: { text: "그가 웃는다. \"그런 건, 쉽게 주면 안 돼. 나한테도.\"\n그러나 시선은 조금 흔들린다.", affinity: 5 } },
      { text: "\"당신의 결말은 뭐예요?\"", check: { stat: "insight", base: 40, difficulty: 50 }, result: { text: "\"결말은 아직 없어. 쓰이지 않았으니까.\"\n그가 아주 조용히 웃는다. \"…결말을 쓰는 건, 읽는 사람의 몫이야.\"", affinity: 15, setFlags: ["kairu_true_name"] }, fail: { text: "\"그건, 내가 정할 게 아니야.\" 그가 시선을 돌린다.", affinity: 2 } },
      { text: "아무 말 없이 손을 잡는다", result: { text: "그의 손이 아주 차갑다. 문신이 살짝 움직인다.\n\"…이거, 위험해. 너는 나를 모르잖아.\"\n그런데 그는 손을 빼지 않는다.", affinity: 10, setFlags: ["kairu_true_name"] } },
    ],
  },
  {
    id: "kairu_3", npcId: "kairu", kind: "chain", title: "쓰이지 않은 결말", minAct: 3, requiresAll: ["bond_kairu_2"], weight: 30,
    text: "열차의 마지막 페이지. 카이루가 그 페이지 위에 서 있다.\n그의 손등 문신이 온몸으로 번지고 있다. 그는 지금, 책으로 돌아가고 있다.\n\"…열차가 멈추면, 나는 다시 책이 돼. 그게 원래 규칙이야.\"\n그가 웃는다. 아주 편안하게. \"너는, 어떻게 하고 싶어?\"",
    choices: [
      { text: "\"당신의 이름을 부르겠습니다.\"", check: { stat: "will", base: 30, difficulty: 60 }, result: { text: "당신이 그의 이름을 부른다. 그가 지어달라고 했던, 그 이름.\n문신이 멈춘다. 아주 천천히, 다시 살색으로 돌아간다.\n\"…이상하지. 이름을 가지니까, 무서워.\"\n그가 아주 조용히 웃는다. \"…이제, 진짜로 살아있는 것 같아.\"", affinity: 30, setFlags: ["kairu_stayed"], nextId: "kairu_final_choice" }, fail: { text: "목이 조인다. 이름이 나오지 않는다. 그가 슬프게 웃는다. \"…괜찮아. 그럴 줄 알았어.\"", affinity: 5 } },
      { text: "\"책으로 돌아가세요. 그게 당신의 자리예요.\"", check: { stat: "insight", base: 40, difficulty: 50 }, result: { text: "그가 아주 오래 당신을 본다. 그러다 고개를 끄덕인다.\n\"…역시, 너는 읽는 사람이구나. 그래서 너에게 맡긴 거야.\"\n그의 몸이 페이지로 흩어진다. 마지막 페이지에, 당신의 이름이 적힌다.", affinity: 20, setFlags: ["kairu_returned"], nextId: "kairu_final_choice" }, fail: { text: "말이 나오지 않는다. 그가 고개를 젓는다. \"…아직, 대답하지 마.\"", affinity: -5 } },
      { text: "그의 손을 잡고, 아무 말도 하지 않는다", result: { text: "당신은 아무 말도 하지 않는다. 그도 아무 말도 하지 않는다.\n문신이 조금씩 번지다가, 멈춘다. 그가 아주 작게 웃는다.\n\"…이런 결말도, 있었네.\"", affinity: 15, setFlags: ["kairu_stayed"], nextId: "kairu_final_choice" } },
    ],
  },
  { id: "kairu_final_choice", npcId: "kairu", kind: "chain", title: "결말", weight: 0, text: "카이루가 마지막 페이지를 넘긴다.", choices: [
    { text: "그의 이름을 부른다", result: { text: "페이지가 멈춘다.", affinity: 5, setFlags: ["kairu_end_confirmed"] } },
  ] },
  ...MEMORY_ENCOUNTERS,
];
