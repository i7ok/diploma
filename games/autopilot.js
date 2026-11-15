const snakeDemo = (() => {
  const moves = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];
  const scores = new Map();

  function direction({size, snake, dir, food, hazards = [], wrap = false, blockTail = false}) {
    const cell = ({x, y}) => y * size + x;
    const tail = snake.length - 1;
    const blocked = new Set([
      ...hazards.map(cell),
      ...snake.slice(0, blockTail ? snake.length : tail).map(cell),
    ]);
    const target = food && cell(food);
    const queue = [{...snake[0], first: null}];
    let fallback = dir;

    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      for (const move of moves) {
        if (!current.first && move.x === -dir.x && move.y === -dir.y) continue;
        let x = current.x + move.x;
        let y = current.y + move.y;
        if (wrap) {
          x = (x + size) % size;
          y = (y + size) % size;
        } else if (x < 0 || y < 0 || x >= size || y >= size) {
          continue;
        }

        const key = cell({x, y});
        if (blocked.has(key)) continue;

        const first = current.first || move;
        if (key === target) return first;
        // Prefer a step into open space if the food is temporarily boxed in.
        fallback = first;
        blocked.add(key);
        queue.push({x, y, first});
      }
    }
    return fallback;
  }

  function mount(canvas) {
    const source = document.getElementById('score');
    const score = document.createElement('output');
    const update = () => {
      score.textContent = source.textContent.match(/\d+/)?.[0].replace(/^0+(?=\d)/, '') ?? '0';
    };
    document.body.append(canvas, score);
    update();
    new MutationObserver(update).observe(source, {childList: true, subtree: true, characterData: true});
  }

  const storage = {
    getItem: key => scores.get(key) ?? null,
    setItem: (key, value) => scores.set(key, String(value)),
  };

  return {direction, mount, storage};
})();
