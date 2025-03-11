function cloneObj(obj) {
    return _deepClone(obj);
}

function _deepClone(obj, map = new WeakMap()) {
    if (obj === null || typeof obj !== "object") {
        return obj; // Return primitives as-is
    }

    if (map.has(obj)) {
        return map.get(obj); // Handle circular references
    }

    if (typeof obj === "function") {
        return new Function(`return ${obj.toString()}`)(); // Clone function
    }

    let clone;
    if (Array.isArray(obj)) {
        clone = [];
        map.set(obj, clone);
        for (let i = 0; i < obj.length; i++) {
            clone[i] = _deepClone(obj[i], map);
        }
    } else {
        clone = {};
        map.set(obj, clone);
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clone[key] = _deepClone(obj[key], map);
            }
        }
    }

    return clone;
}