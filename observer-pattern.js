const listeners = [];

listeners.push(() => {
    console.log(1)
})

listeners.push(() => {
    console.log(2)
})

for (let i = 0; i < listeners.length; i += 1) {
    const listener = listeners[i];
    listener();
}