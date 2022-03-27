module.exports = function markdownItBidi(md) {
  const rules = [
    'heading_open',
    'blockquote_open',
    'paragraph_open',
    'bullet_list_open',
    'ordered_list_open',
    'table_open',
    'th_open',
    'td_open'
  ];

  const unsupportedTypes = [
    'bullet_list_open',
    'ordered_list_open',
  ];

  const isFirstChildInBlockquote = (prevToken) =>
    (prevToken && prevToken.type === 'blockquote_open');

  const isFirstThInTable = (token, prevToken) => 
    (token.type === 'th_open' && prevToken.type === 'tr_open');

  const isInDeactiveRange = (range, targetRange) => {
    const [start] = range || [null];
    if (!targetRange.length) return false;
    if (start >= targetRange[0] && start < targetRange[1]) return true;
    return false;
  };

  const bidi = defaultRenderer => (tokens, idx, opts, env, self) => {
    if (env.deactiveRange === undefined)
      env.deactiveRange = [];

    const token = tokens[idx];
    const prevToken = tokens[idx - 1];

    if (!isInDeactiveRange(token.map, env.deactiveRange)) {
      env.deactiveRange = [];

      if (!isFirstChildInBlockquote(prevToken)
        && !isFirstThInTable(token, prevToken)
      ) {
        token.attrSet('dir', 'auto');
      }

      if (unsupportedTypes.includes(token.type))
        env.deactiveRange = token.map;
    }
    return defaultRenderer(tokens, idx, opts, env, self);
  };

  const proxy = (tokens, idx, opts, _, self) => {
    return self.renderToken(tokens, idx, opts);
  };

  rules.forEach(rule => {
    const defaultRenderer = md.renderer.rules[rule] || proxy;
    md.renderer.rules[rule] = bidi(defaultRenderer);
  });
};
