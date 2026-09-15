// Long-form explanatory copy, kept in its own namespace so the main
// translations table stays focused on short UI micro-copy.
// Merged into the lookup table by LanguageProvider.

export const conceptStrings = {
  ko: {
    'gfx.concept.heading': '3D 그래픽스 수학 개념',
    'gfx.concept.intro': '3D 그래픽스 파이프라인에서 MVP(Model-View-Projection) 행렬은 3D 물체를 2D 화면에 투영하는 핵심 변환입니다. Model 행렬은 물체의 위치·회전·크기를, View 행렬은 카메라 시점을, Projection 행렬은 원근 투영을 담당합니다.',
    'gfx.concept.lightTitle': '조명 모델',
    'gfx.concept.lightDesc': 'Directional(태양광), Point(전구), Spot(손전등) 세 가지 광원 타입을 실시간으로 전환하며 효과를 비교할 수 있습니다.',
    'gfx.concept.shadowTitle': '그림자 매핑',
    'gfx.concept.shadowDesc': '광원에서 깊이 버퍼를 생성해 그림자를 렌더링합니다. Basic·PCF·PCF Soft 세 가지 품질을 선택할 수 있습니다.',
    'gfx.concept.frustumTitle': 'Frustum (시야체)',
    'gfx.concept.frustumDesc': 'FOV, Near/Far 평면, Aspect Ratio로 정의되는 절두체입니다. 이 영역 밖의 물체는 렌더링되지 않습니다(클리핑).',
    'gfx.concept.normalTitle': '법선 벡터',
    'gfx.concept.normalDesc': '각 면에 수직인 벡터로 조명 계산의 핵심입니다. 법선 방향과 광원 방향의 내적으로 밝기를 결정합니다.',
  },

  en: {
    'gfx.concept.heading': '3D graphics math concepts',
    'gfx.concept.intro': 'In the 3D graphics pipeline, the MVP (Model-View-Projection) matrix is the core transform that projects a 3D object onto a 2D screen. The Model matrix handles position, rotation, and scale; the View matrix handles the camera; the Projection matrix handles perspective.',
    'gfx.concept.lightTitle': 'Lighting models',
    'gfx.concept.lightDesc': 'Switch between Directional (sunlight), Point (bulb), and Spot (flashlight) sources in real time and compare their effect.',
    'gfx.concept.shadowTitle': 'Shadow mapping',
    'gfx.concept.shadowDesc': 'Shadows are rendered by generating a depth buffer from the light. Choose between Basic, PCF, and PCF Soft quality levels.',
    'gfx.concept.frustumTitle': 'Frustum',
    'gfx.concept.frustumDesc': 'The viewing volume defined by FOV, near/far planes, and aspect ratio. Anything outside it is not rendered (clipping).',
    'gfx.concept.normalTitle': 'Normal vectors',
    'gfx.concept.normalDesc': 'A vector perpendicular to each face, central to lighting. Brightness comes from the dot product of the normal and the light direction.',
  },
};
