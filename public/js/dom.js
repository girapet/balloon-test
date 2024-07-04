
const toArray = (target) => {
  if (target instanceof Array) {
    return target;
  }
  else if (target instanceof HTMLElement) {
    return [target];
  }
  else if (target instanceof HTMLCollection) {
    return Array.from(target);
  }
};

const add = (target, children) => {
  const elements = toArray(children);
 
  if (!elements) {
    throw new Error('invalid child elements');
  }

  elements.forEach((c) => target.appendChild(c));
};

const each = (target, action) => {
  const elements = toArray(target);
 
  if (!elements) {
    throw new Error('invalid target');
  }

  elements.forEach((e) => action(e));
};

const create = (tagName, content) => {
  const element = document.createElement(tagName);
 
  if (content) {
    if (content.constructor.name === 'String') {
      element.innerHTML = content;
    }
    else {
      each(content, (c) => element.appendChild(c));
    }
  }

  return element;
};

const find = (...args) => {
  const selector = args.pop();
  const target = args.length ? args[0] : document;
  return Array.from(target.querySelectorAll(selector));
}

const get = (id) => document.getElementById(id);

const on = (target, type, handler) => each(target, (e) => e.addEventListener(type, handler));

const style = (target, styles) => each(target, (e) => {
  Object.entries(styles).forEach((s) => {
    const [ name, value ] = s;
    e.style[name] = value;
  });
});

export default { add, create, each, find, get, on, style };
