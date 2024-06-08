const CONSOLE_STYLE = `font-size:1rem;color:darkblue; font-family: 'MyCustomFont', 'Courier New', Courier, monospace`;
function inform(message) {
    console.log(`%c${message}`, CONSOLE_STYLE);
}
export default inform;
