export const useJavascript= (callback:() => void) => requestAnimationFrame(callback);