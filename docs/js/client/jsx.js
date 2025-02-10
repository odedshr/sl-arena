function jsx(tag, attributes, ...children) {
    if (typeof tag === 'function') {
        return tag(attributes !== null && attributes !== void 0 ? attributes : {}, children);
    }
    const element = document.createElement(tag);
    // Assign attributes:
    let map = (attributes !== null && attributes !== void 0 ? attributes : {});
    let prop;
    for (prop of Object.keys(map)) {
        // Extract values:
        prop = prop.toString();
        const value = map[prop];
        const anyReference = element;
        if (typeof anyReference[prop] === 'undefined') {
            // As a fallback, attempt to set an attribute:
            element.setAttribute(prop, value);
        }
        else {
            anyReference[prop] = value;
        }
    }
    // append children
    for (let child of children) {
        if (typeof child === 'string' || typeof child === 'number') {
            element.innerText += child;
            continue;
        }
        if (Array.isArray(child)) {
            element.append(...child);
            continue;
        }
        element.appendChild(child);
    }
    return element;
}
export default jsx;
