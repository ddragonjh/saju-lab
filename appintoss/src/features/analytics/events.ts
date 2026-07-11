export type AnalyticsEvent =
  | 'app_open'
  | 'home_view'
  | 'saju_start'
  | 'saju_complete'
  | 'saju_result_view'
  | 'daily_fortune_view'
  | 'weekly_fortune_view'
  | 'monthly_fortune_view'
  | 'zodiac_view'
  | 'tarot_start'
  | 'tarot_card_select'
  | 'tarot_complete'
  | 'oracle_topic_select'
  | 'oracle_result_view'
  | 'result_save'
  | 'result_delete'
  | 'result_share'
  | 'settings_view'
  | 'legal_view'
  | 'error';

export function trackEvent(_event: AnalyticsEvent): void {
  // WebView 공식 분석 SDK는 현재 확인한 문서 기준 React Native 초기화만 명시되어 있어
  // 개인정보 없는 이벤트 이름 목록만 유지하고 네트워크 전송은 하지 않습니다.
}
