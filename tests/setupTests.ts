import '@testing-library/jest-dom';

// Global test setup
global.mockLLMResponse = {
  guideDialog: {
    guide_message: '让我们一起走进主角的日常...',
    suggested_questions: ['他/她通常几点起床？', '最喜欢的地方是哪里？']
  },
  extractInfo: {
    extracted_data: {
      daily_life: '清晨六点，她总是第一个到咖啡馆',
      latent_dissatisfaction: '生活一成不变',
      emotional_anchor: '那杯永远不变的拿铁',
      hidden_desire: '渴望突破现状',
      world_setting: '现代都市'
    },
    confidence_scores: {
      daily_life: 0.95,
      latent_dissatisfaction: 0.8,
      emotional_anchor: 0.9,
      hidden_desire: 0.75,
      world_setting: 0.85
    }
  },
  checkCompleteness: {
    overall_score: 0.85,
    can_proceed: true,
    missing_items: []
  }
};

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};
