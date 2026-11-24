import type { Encounter, EncounterChoice } from "../types/encounter";
import type { MapNode } from "../types/game";

export const EXPANDED_STORY = "station_expanded_v1";
export const chapterLength = (flags: readonly string[]) => flags.includes(EXPANDED_STORY) ? 12 : 8;
export const STORY_SCHEDULE: Record<number, Record<number, string>> = {
  1: { 2: "station_timetable", 5: "main_manifest", 9: "main_luggage", 11: "main_signal" },
  2: { 2: "station_window_echo", 5: "main_mail", 9: "main_switch", 11: "main_record" },
  3: { 2: "main_platform", 5: "main_lamp", 9: "station_gate_name", 11: "main_last_ticket" },
};
export function storyNode(act: number, floor: number, storyId: string, flags: readonly string[]): MapNode | undefined {
  if (storyId !== "unnamed_station" || !flags.includes(EXPANDED_STORY)) return;
  const id = STORY_SCHEDULE[act]?.[floor];
  if (!id) return;
  const title = MAIN_STORY_ENCOUNTERS.find(e => e.id === id)?.title ?? ({station_timetable:"검게 지워진 시간표",station_window_echo:"창문 너머의 승객",station_gate_name:"새벽역의 닫힌 개찰구"} as Record<string,string>)[id];
  return { id: `a${act}f${floor}main`, type:"event", encounterId:id, title, preview:"이름 없는 역 · 메인 이야기" };
}
const choice = (text: string, result: string, flags: string[] = [], nextId?: string): EncounterChoice => ({text,result:{text:result,setFlags:flags,nextId}});
const scene = (act: number, id: string, title: string, text: string, choices: EncounterChoice[]): Encounter => ({id, title, text, choices, kind:"event", storyId:"unnamed_station", minAct:act, weight:0});

export const MAIN_STORY_ENCOUNTERS: Encounter[] = [
  scene(1,"main_manifest","두 사람의 승차 기록", "객차 끝의 검표대에는 종이가 두 장 놓여 있다. 하나는 오늘 날짜, 다른 하나는 오래전 비가 내린 밤의 기록이다. 오래된 기록에는 승객 두 명이 나란히 적혀 있지만, 두 번째 이름은 지워져 있다. 검표기의 바늘이 당신의 차표를 향해 움직인다.\n\n기록을 관리하던 무명의 역무원은 빈칸을 보며 말한다. ‘이름을 잃었다고 해서 타지 않은 사람이 되는 건 아닙니다.’", [
    choice("두 사람의 좌석 번호를 비교한다", "두 좌석은 같은 예약 번호로 묶여 있다. 우연히 만난 승객이 아니라 처음부터 함께 여행했던 사람이다.",["main_shared_seats"],"main_manifest_reply"),
    choice("삭제된 이름 옆의 검표 도장을 확인한다", "도장은 하차가 아니라 미도착을 의미한다. 누군가를 내렸다고 기록한 것이 아니라, 도착 자체를 기록하지 못한 것이다.",["main_missing_arrival"],"main_manifest_reply"),
  ]),
  scene(1,"main_manifest_reply","비어 있는 도착란", "역무원이 빈 도착란을 가리킨다. 이 열차는 도착하지 못한 기록을 싣고 다니며, 이름이 없는 역으로는 표를 발권할 수 없다. 그렇다면 차표를 잃어버린 것은 당신만이 아니었다.\n\n‘그날 두 사람은 어디까지 가려고 했습니까?’ 질문에 대답하려는데 기억 대신 빗소리만 들린다.", [
    choice("기록을 수첩에 옮겨 두 사람의 흔적을 보존한다", "아직 이름은 없지만 두 사람이 함께 탔다는 사실만은 남겼다. 수첩 안에서 반쪽 차표가 작은 소리를 낸다.",["main_manifest_proof"]),
    choice("빈 도착란을 그대로 둔다", "모르는 것을 억지로 채우지 않기로 했다. 역무원은 기록을 접어 보관하고, 다음에 다시 확인할 수 있다고 말한다.",["main_manifest_reserved"]),
  ]),
  scene(1,"main_luggage","돌아오지 않은 가방", "짐칸의 선반 위에 오래된 여행 가방이 놓여 있다. 가죽 손잡이에는 빗물 자국이 남았고, 손잡이에 매인 표찰에는 당신의 좌석 번호가 적혀 있다. 가방 안에는 여벌의 옷과 두 사람분의 마른 빵, 작은 손전등이 들어 있다.\n\n바닥에 접힌 지도에는 한 역으로 이어지는 길이 그려져 있다.", [
    choice("지도에 표시된 길을 따라가 본다", "지도에는 본선에서 벗어난 작은 승강장이 표시되어 있다. 옆에는 ‘새벽 전에 불을 켤 것’이라는 메모가 있다.",["main_map_read"],"main_luggage_reply"),
    choice("빵과 손전등을 보며 기억을 더듬는다", "누군가에게 손전등을 건네고 자신은 지도를 챙겼던 기억이 스친다. 두 사람이 서로 다른 일을 맡았던 것 같다.",["main_luggage_memory"],"main_luggage_reply"),
  ]),
  scene(1,"main_luggage_reply","비에 젖은 지도", "가방 안쪽에서 지도와 같은 종이로 만든 표찰이 떨어진다. 열차 안의 지도에는 없는 선로가 그려져 있다. 선로는 새벽역의 이름이 지워진 자리에서 끊긴다. 누군가 돌아갈 길을 남기려 애쓴 흔적이다.", [
    choice("표찰을 차표와 함께 보관한다", "두 조각이 맞닿자 표찰의 선로가 아주 희미하게 이어진다. 그날의 길을 다시 찾아볼 수 있겠다.",["main_map_proof"]),
    choice("가방에 돌려놓고 주인을 기다린다", "가방을 닫고 표찰을 제자리에 두었다. 기억을 빼앗지 않고도 길을 찾을 방법이 있을 것이다.",["main_map_reserved"]),
  ]),
  scene(1,"main_signal","세 번 깜박이는 불빛", "창밖에 폐쇄된 신호소가 지나간다. 창문 너머의 손전등이 세 번 깜박이고, 잠시 뒤 똑같은 간격으로 또 깜박인다. 수첩의 지도와 낡은 승차 기록이 동시에 떨린다. 아무도 없는 줄 알았던 역에 누군가 여전히 신호를 보내고 있다.", [
    choice("같은 간격으로 객차의 등을 세 번 깜박인다", "멀리 있던 불빛이 한 번 길게 켜진다. 신호가 닿았다. 상대는 당신이 살아 있다는 것을 알아차린 듯하다.",["main_signal_answer"],"main_signal_reply"),
    choice("불빛의 위치를 수첩에 표시한다", "불빛은 열차가 움직여도 같은 방향에 머문다. 정거장이 아니라 열차 쪽의 시간이 반복되는 것처럼 보인다.",["main_signal_position"],"main_signal_reply"),
  ]),
  scene(1,"main_signal_reply","아직 기다리는 사람", "창틀 아래의 통신관에서 잡음이 흘러나온다. ‘길을 찾으면 돌아온다고 했지. 급히 오지 않아도 돼. 여기 불은 켜 둘게.’ 낯선 목소리인데도 당신은 마지막 문장을 이미 알고 있었던 것 같다.\n\n통신관 위로 첫 번째 책의 마지막 문이 모습을 드러낸다.", [
    choice("기다리는 사람에게 반드시 답하겠다고 전한다", "잡음 너머에서 짧은 웃음소리가 들린다. 누군가의 기다림은 아직 끝나지 않았다.",["main_signal_proof"]),
    choice("지금은 대답 대신 신호를 기억한다", "대답은 나중에 직접 전하기로 했다. 손전등의 빛이 어둠 속에서도 오래 남는다.",["main_signal_reserved"]),
  ]),
  scene(2,"main_mail","발송되지 않은 편지", "우편 객차에 들어서자 분류함 하나만 열린다. 새벽역 앞으로 보낸 편지가 수십 통 쌓여 있다. 모두 수취인 불명으로 돌아왔고, 그중 한 봉투는 당신의 필체다. 봉투에는 떠나던 날의 날짜가 적혀 있다.\n\n편지의 첫 줄은 사과가 아니라 설명이다. ‘선로가 다시 끊기기 전에 다른 쪽에서 길을 열어 볼게.’", [
    choice("자신이 쓴 편지를 끝까지 읽는다", "당신은 그 사람을 두고 도망치려 했던 것이 아니었다. 끊어진 선로를 확인하려고 열차에 올랐다.",["main_mail_read"],"main_mail_reply"),
    choice("반송 도장을 비교해 본다", "모든 편지가 같은 날에 반송되어 있다. 그날 이후로 역의 주소 자체가 없어졌다는 뜻이다.",["main_mail_dates"],"main_mail_reply"),
  ]),
  scene(2,"main_mail_reply","도착하지 못한 이유", "편지 뒷면에는 주소 대신 작은 그림이 있다. 선로 하나와 신호등, 그 옆에 나란히 놓인 두 장의 표. ‘한쪽이 돌아오지 못하면 다른 쪽에서 신호를 보내기로 하자.’ 당신이 기억하지 못한 약속의 일부다.\n\n우편함의 문이 닫히기 전에 편지를 어떻게 할까?", [
    choice("편지를 차표와 함께 보관한다", "이 편지는 떠났던 이유를 증명한다. 언젠가 직접 건네기 위해 봉투를 접어 넣었다.",["main_mail_proof"]),
    choice("다음 우편물과 함께 다시 발송한다", "역이 돌아오는 날 이 편지도 도착하기를 바랐다. 우편함에 아주 작은 불이 들어온다.",["main_mail_sent"]),
  ]),
  scene(2,"main_switch","갈라지는 선로", "객차의 연결문이 열리자 철길이 보인다. 두 선로 가운데 하나는 매끈하고 다른 하나는 끝이 어둠에 잠겨 있다. 오래전의 당신이 분기기 옆에 서 있다. ‘먼저 신호소로 가. 내가 이쪽에서 길을 찾을게.’\n\n기억 속 두 사람은 서로의 차표를 반으로 나누고 헤어졌다. 그런데 분기기가 움직이던 순간, 역의 이름이 소리 없이 지워진다.", [
    choice("분기기의 잠금 장치를 확인한다", "기계에는 고장 표시가 없다. 역이 사라지는 순간 기록이 자동으로 폐쇄되도록 만들어져 있었다.",["main_switch_rule"],"main_switch_reply"),
    choice("기억 속 자신의 발걸음을 따라간다", "당신은 새벽역에서 멀어지는 대신 다른 선로를 따라 그곳으로 돌아가려 했다. 그러나 같은 열차로 몇 번이고 되돌아왔다.",["main_switch_loop"],"main_switch_reply"),
  ]),
  scene(2,"main_switch_reply","길을 막는 문장", "분기기 아래에 정비 지침서가 끼어 있다. 도착지를 잃은 이야기는 종결될 때까지 같은 선로를 반복한다. 마지막 장은 열차의 목적지를 비운 채 운행을 끝내려 한다. 새벽역을 다시 지도에 올리려면 이름뿐 아니라 그곳으로 가려던 사람의 의지도 남겨야 한다.", [
    choice("지침의 예외를 수첩에 옮긴다", "누군가 도착을 선택하고 기록을 남기면 폐쇄된 선로도 다시 열릴 수 있다. 이제 무엇과 싸워야 하는지 알겠다.",["main_switch_proof"]),
    choice("닫힌 선로의 위험을 기억해 둔다", "억지로 분기기를 건드리지는 않았다. 돌아갈 길은 기억과 차표를 함께 되찾은 뒤 열어야 한다.",["main_switch_reserved"]),
  ]),
  scene(2,"main_record","그날의 검표 기록", "오래된 검표실의 유리창에 당신이 지나온 밤이 비친다. 신호소에 남은 사람이 먼저 손전등을 켜고, 당신은 움직이는 열차의 문 앞에서 손을 흔든다. 그 순간 운행 기록이 검게 물들었다. 역의 이름과 기억은 같은 잉크 속으로 빨려 들어갔다.\n\n기록의 마지막 줄에는 당신이 직접 쓴 ‘돌아오겠다’는 말이 남아 있다.", [
    choice("자신의 약속을 다시 읽는다", "잊고 있던 이유가 분명해진다. 당신은 길을 열려고 떠났고, 그 길을 잃어버린 것이다.",["main_reason_read"],"main_record_reply"),
    choice("기다리는 사람의 마지막 행동을 확인한다", "그 사람은 문을 막지 않았다. 대신 신호소에 남아 돌아올 방향을 알리기로 했다.",["main_waiter_read"],"main_record_reply"),
  ]),
  scene(2,"main_record_reply","서로 맡았던 일", "기록은 두 사람의 선택을 나란히 보여 준다. 누구도 다른 사람에게 기다리라고 강요하지 않았다. 각자가 길의 한쪽을 맡았다. 기억이 되살아난 지금, 당신은 그 약속을 어떤 형태로 남기고 싶은가?", [
    choice("떠났던 이유와 상대의 선택을 함께 기록한다", "두 사람의 뜻이 하나의 기록에 돌아왔다. 이번에는 상대의 대답까지 직접 듣기로 했다.",["main_reason_proof"]),
    choice("기억을 그대로 두고 새 답을 준비한다", "그날의 약속을 되풀이하기보다 지금의 마음으로 대답할 수도 있다. 당신은 수첩을 닫았다.",["main_reason_reserved"]),
  ]),
  scene(3,"main_platform","지도 밖의 승강장", "창문이 문처럼 열리고, 푸른 새벽빛이 객차로 들어온다. 플랫폼의 시계는 출발했던 밤에 멈춰 있고 역명판은 비어 있다. 먼 곳에서 손전등 하나가 깜박인다. 아직 도착한 것은 아니지만, 이제 역의 윤곽은 선명하다.\n\n당신이 내딛는 발밑에서 지워진 선로가 한 칸씩 이어진다.", [
    choice("수첩에 남은 기록을 펼쳐 길을 확인한다", "기록의 빈칸과 실제 플랫폼의 위치가 겹친다. 역이 사라진 것이 아니라 도착할 수 있는 이름을 잃은 것이다.",["main_platform_read"],"main_platform_reply"),
    choice("차표를 높이 들어 신호를 보낸다", "어둠 속 손전등이 대답한다. 당신은 이제 혼자서 길을 찾는 것이 아니다.",["main_platform_signal"],"main_platform_reply"),
  ]),
  scene(3,"main_platform_reply","되찾는 이름", "역명판 아래에는 지워지기 전의 글자가 희미하게 남아 있다. 다른 역들의 이름도 작은 흠집처럼 겹쳐 보인다. 당신에게 필요한 것은 이곳의 이름을 되살리는 일이다. 잊힌 이름을 전부 자신이 정할 필요는 없다.", [
    choice("새벽역이라는 이름을 차표에 적는다", "글자가 검은 흔적 위로 천천히 떠오른다. 역명판은 아직 완전히 밝지 않지만 목적지는 분명해졌다.",["main_platform_proof"]),
    choice("상대가 직접 역명을 말해 줄 때까지 기다린다", "빈칸을 남겨 둔다. 기다리는 사람에게도 이곳의 이름을 되찾을 권리가 있다.",["main_platform_reserved"]),
  ]),
  scene(3,"main_lamp","꺼지지 않은 신호등", "신호소의 등불은 유리가 깨져 있는데도 빛을 내고 있다. 손잡이에는 오래된 천 조각이 감겨 있다. 그 사람이 비를 피해 신호를 보낼 수 있도록 당신이 묶어 주었던 것이다. 등불 곁의 작은 메모에는 ‘돌아오면 물어볼 것’이라고 적혀 있다.\n\n무엇을 물으려 했을까. 그 아래에는 아직 아무 문장도 없다.", [
    choice("등불을 지켜 온 사람의 말을 듣는다", "통신관에서 목소리가 돌아온다. ‘길을 찾았어? 그럼 이제 어디로 가고 싶은지도 생각해 봐.’ 기다림은 명령이 아니었다.",["main_lamp_listen"],"main_lamp_reply"),
    choice("등불 아래의 선로를 확인한다", "신호등의 빛이 닿는 곳에서 선로가 다시 이어진다. 그 사람은 당신이 돌아올 방향을 계속 밝히고 있었다.",["main_lamp_track"],"main_lamp_reply"),
  ]),
  scene(3,"main_lamp_reply","함께 내릴 수 있는 역", "손전등이 이제 눈앞에서 깜박인다. 플랫폼을 가로지르는 마지막 문만 열면 두 사람은 만날 수 있다. 신호소에 남았던 사람이 당신에게 묻는다. ‘이번에는 우리가 정해도 되는 거지?’\n\n그 질문은 새벽역을 되찾는 것과 앞으로의 길을 고르는 것이 서로 다른 일임을 알려 준다.", [
    choice("누구도 대신 결말을 정하지 않겠다고 답한다", "두 장의 차표가 동시에 따뜻해진다. 이제 역의 이름도, 다음 목적지도 당사자들이 고를 수 있다.",["main_lamp_proof"]),
    choice("마지막 문을 지난 뒤 함께 이야기하자고 답한다", "상대는 기다리겠다고 말한다. 이번 기다림에는 끝나는 시간이 있다.",["main_lamp_reserved"]),
  ]),
  scene(3,"main_last_ticket","마지막 검표", "마지막 장 바로 앞에 검표기가 서 있다. 기계는 당신의 반쪽 차표를 읽고 ‘미완결’이라는 표시를 띄운다. 뒤이어 다른 차표의 번호가 나타난다. 처음부터 두 장은 같은 여정에 속해 있었다.\n\n검표기는 마지막 장의 명령대로 빈 도착란을 닫으려 한다. 지금이라면 그 기록에 무엇을 남길지 선택할 수 있다.", [
    choice("두 사람의 여정을 한 장의 기록으로 연결한다", "미도착 표시가 흔들린다. 두 사람의 출발과 기다림, 되돌아온 길이 한 줄의 기록으로 이어진다.",["main_ticket_joined"],"main_last_ticket_reply"),
    choice("각자의 차표를 각자의 이름으로 남긴다", "두 사람의 여정은 서로 연결되지만 하나가 다른 하나를 대신하지 않는다. 검표기는 두 장을 모두 인정한다.",["main_ticket_separate"],"main_last_ticket_reply"),
  ]),
  scene(3,"main_last_ticket_reply","결말을 쓰는 사람", "검표기의 불빛이 꺼지고 마지막 장의 문이 열린다. 문 너머에서 검은 문장이 길게 일어난다. 이 문장은 끝나지 않은 이야기를 지우려 하지만, 당신이 쌓아 온 기록은 그것이 전부가 아니라고 말한다.\n\n아직 마지막 답은 쓰이지 않았다. 싸움이 끝나면 그 답을 직접 전할 수 있을 것이다.", [
    choice("기억과 약속을 간직한 채 마지막 장으로 향한다", "차표의 빈칸을 손으로 감싼다. 당신은 이 이야기의 마지막 문장을 스스로 고르기로 했다.",["main_final_proof"]),
    choice("새로운 답을 찾기 위해 마지막 장으로 향한다", "지나온 이야기를 부정하지 않되 앞으로 무엇을 할지는 아직 정하지 않았다. 문 너머로 발을 내딛는다.",["main_final_open"]),
  ]),
];

export function mainStoryComplete(flags: ReadonlySet<string>): boolean {
  return (flags.has("main_manifest_proof") || (flags.has("main_map_proof") && flags.has("main_signal_proof")))
    && (flags.has("main_reason_proof") || (flags.has("main_mail_proof") && flags.has("main_switch_proof")))
    && flags.has("main_final_proof") && (flags.has("main_platform_proof") || flags.has("main_lamp_proof") || flags.has("station_event_full_name"));
}
