export default function toArray(obj) {
    if (!(obj instanceof Object)) {
        return obj;
    }

    return Object.keys(obj).map(function (key) {
        if ('object' === typeof obj[key]) {
            return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
        } else {
            return obj[key];
        }
    });
}