const PRIORITY_SELECTORS: Array<{ selector: string; priority: number }> = [
  { selector: "nav, header nav, [role='navigation'], .navbar, .nav", priority: 1 },
  { selector: "header, main header, .hero, .hero-section", priority: 2 },
  { selector: "h1, h2, h3, [class*='heading']", priority: 3 },
  { selector: "p, li, td, th, span, a, button, label", priority: 4 },
  { selector: "footer, .footer, [class*='footer']", priority: 5 },
];

const PRIORITY_DEFAULT = 10;

function getPriority(el: Element): number {
  for (const { selector, priority } of PRIORITY_SELECTORS) {
    if (el.matches(selector)) {
      return priority;
    }
  }
  return PRIORITY_DEFAULT;
}

export interface PriorityJob {
  node: Text;
  original: string;
  priority: number;
  boundingBox: DOMRect | null;
}

export function sortByPriority(jobs: PriorityJob[]): PriorityJob[] {
  return jobs.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    if (a.boundingBox && b.boundingBox) {
      return a.boundingBox.top - b.boundingBox.top;
    }
    return 0;
  });
}

export function harvestTextNodesWithPriority(root: HTMLElement): PriorityJob[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const skipSelectors = [
        "script", "style", "noscript", "code", "pre",
        "[data-notranslate]", "[contenteditable]", "input", "textarea",
      ];

      if (skipSelectors.some(sel => parent.matches(sel) || parent.closest(sel))) {
        return NodeFilter.FILTER_REJECT;
      }

      const text = node.textContent?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      if (parent.dataset.txDone) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const jobs: PriorityJob[] = [];
  let node = walker.nextNode();

  while (node !== null) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const parent = node.parentElement;
      const priority = parent ? getPriority(parent) : PRIORITY_DEFAULT;
      const boundingBox = parent?.getBoundingClientRect();

      jobs.push({
        node: node as Text,
        original: node.textContent.trim(),
        priority,
        boundingBox: boundingBox ? new DOMRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height) : null,
      });
    }
    node = walker.nextNode();
  }

  return sortByPriority(jobs);
}

export function prioritizeAboveFold(jobs: PriorityJob[]): PriorityJob[] {
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  return jobs.sort((a, b) => {
    const aAbove = a.boundingBox && a.boundingBox.top < viewportHeight;
    const bAbove = b.boundingBox && b.boundingBox.top < viewportHeight;

    if (aAbove && !bAbove) return -1;
    if (!aAbove && bAbove) return 1;

    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.boundingBox && b.boundingBox) return a.boundingBox.top - b.boundingBox.top;

    return 0;
  });
}
