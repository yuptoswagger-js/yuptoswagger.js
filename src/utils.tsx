
const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

const isArray = (item: any) => {
  return (item && typeof item === 'object' && Array.isArray(item))
}

export const mergeObjects: any = (target: any, ...sources: any) => {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) target[key] = {}
          mergeObjects(target[key], source[key])
        } 
        else if (isArray(source[key]) && isArray(target[key])) {
          target[key] = target[key].concat(source[key]) 
        }
        else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
  
    return mergeObjects(target, ...sources);
  }