const CONSOLE_STYLE = `font-size:1rem;background-color:white;color:darkblue; font-family: 'MyCustomFont', 'Courier New', Courier, monospace`;
function inform(...elements) {
    console.log(`%c${elements[0]}`, CONSOLE_STYLE, ...elements.slice(1));
}
export default inform;
