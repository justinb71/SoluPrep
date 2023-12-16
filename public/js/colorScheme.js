function lightMode() {
    const root = document.documentElement;

    root.style.setProperty('--gray-25', '#FCFCFD');
    root.style.setProperty('--gray-200', '#EAECF0');
    root.style.setProperty('--gray-300', '#D0D5DD');
    root.style.setProperty('--gray-500', '#667085');
    root.style.setProperty('--gray-700', '#344054');
    root.style.setProperty('--gray-900', '#101828');

    root.style.setProperty('--primary-50', '#F9F5FF');
    root.style.setProperty('--primary-100', '#F4EBFF');
    root.style.setProperty('--primary-500', '#9E77ED');
    root.style.setProperty('--primary-600', '#7F56D9');
    root.style.setProperty('--primary-700', '#6941C6');
    root.style.setProperty('--primary-800', '#53389E');

    root.style.setProperty('--font-logo', '#475467');
    root.style.setProperty('--font-700', '#344054');
    root.style.setProperty('--font-buttons', '#000000');
    root.style.setProperty('--font-side-panel-buttons', '#d4d1d1');

    root.style.setProperty('--button-svg', '#667085');
    root.style.setProperty('--text-box-background', '#FFFFFF');
    root.style.setProperty('--odd-table', '#F4EBFF');
    root.style.setProperty('--even-table', '#FCFCFD');
    root.style.setProperty('--white', '#FFFFFF');
    root.style.setProperty('--black', '#000000');
    root.style.setProperty('--profile-pic-background', '#D6BBFB');
    
    root.style.setProperty('--dashboard_usage_card-1', 'linear-gradient(90deg, #4d65d1, #5a71d6)');
    root.style.setProperty('--dashboard_usage_card-2', 'linear-gradient(90deg, #4d65d1, #5a71d6)');
    root.style.setProperty('--dashboard_usage_card-3', 'linear-gradient(90deg, #4d65d1, #5a71d6)');

    root.style.setProperty('--backgound', '#FFFFFF');

    root.style.setProperty('--main-background', '#FCFCFD');
    root.style.setProperty('--scrollbar-hover', 'rgb(148, 148, 148)');
    root.style.setProperty('--seperate-bar', '#F2F4F7');
    root.style.setProperty('--border', '#eceef1');
    root.style.setProperty('--quiz-create-questions-heading', '#373a41');

    root.style.setProperty('--success', '#32D583');
    root.style.setProperty('--success-100', '#D1FADF');
    root.style.setProperty('--primary-color', '#3498db');
    root.style.setProperty('--primary-dark-color', '#3498db80');
    }

function darkMode() {
    const root = document.documentElement;

    root.style.setProperty('--gray-25', '#2C2F33');
    root.style.setProperty('--gray-200', '#3C4043');
    root.style.setProperty('--gray-300', '#50555C');
    root.style.setProperty('--gray-500', '#A8ABB0');
    root.style.setProperty('--gray-700', '#CED1D7');
    root.style.setProperty('--gray-900', '#F5F8FA');

    root.style.setProperty('--primary-50', '#F9F5FF');
    root.style.setProperty('--primary-100', '#F4EBFF');
    root.style.setProperty('--primary-500', '#9E77ED');
    root.style.setProperty('--primary-600', '#7F56D9');
    root.style.setProperty('--primary-700', '#6941C6');
    root.style.setProperty('--primary-800', '#53389E');

    root.style.setProperty('--font-logo', '#dbd7d7');
    root.style.setProperty('--font-700', '#d4d1d1');
    root.style.setProperty('--font-side-panel-buttons', '#d4d1d1');

    root.style.setProperty('--button-svg', '#c7cbd4');
    root.style.setProperty('--text-box-background', '#454649');
    root.style.setProperty('--odd-table', '#5b5068');
    root.style.setProperty('--even-table', '#5b5068');
    root.style.setProperty('--profile-pic-background', 'rgb(54, 45, 77)');
    root.style.setProperty('--graph-background', '#46335c');
    root.style.setProperty('--white', '#FFFFFF');
    root.style.setProperty('--black', '#000000');

    root.style.setProperty('--dashboard_usage_card-1', 'linear-gradient(90deg, #4d65d1, #5a71d6)');
    root.style.setProperty('--dashboard_usage_card-2', 'linear-gradient(90deg, #704dd1, #855ad6)');
    root.style.setProperty('--dashboard_usage_card-3', 'linear-gradient(90deg, #4d65d1, #5a71d6)');

    root.style.setProperty('--backgound', '#0c0c0d');
    root.style.setProperty('--main-background', '#181718');
    root.style.setProperty('--scrollbar-hover', 'rgb(66, 66, 66)');
    root.style.setProperty('--separate-bar', '#2C2F33');
    root.style.setProperty('--border', '#252627');
    root.style.setProperty('--quiz-create-questions-heading', '#F5F8FA');

    root.style.setProperty('--success', '#17aa61');
    root.style.setProperty('--success-100', '#D1FADF');
    root.style.setProperty('--primary-color', '#3498db');
    root.style.setProperty('--primary-dark-color', '#02020280');
}

document.addEventListener('DOMContentLoaded', function () {
    const modeSwitch1 = document.getElementById('modeSwitch1');
    const modeSwitch2 = document.getElementById('modeSwitch2');
    darkMode();

    function toggleMode1() {
        if (modeSwitch1.checked) {
            darkMode();
            localStorage.setItem('mode', 'dark');
        } else {
            lightMode();
            localStorage.setItem('mode', 'light');
        }
    }

    function toggleMode2() {
        if (modeSwitch2.checked) {
            darkMode();
            localStorage.setItem('mode', 'dark');
        } else {
            lightMode();
            localStorage.setItem('mode', 'light');
        }
    }

    // Restore mode preference from localStorage
    const savedMode = localStorage.getItem('mode');
    if (savedMode === 'dark') {
        modeSwitch1.checked = true;
        modeSwitch2.checked = true;
        darkMode();
    } else {
        modeSwitch1.checked = true;
        modeSwitch2.checked = true;
        darkMode();
    }

    // Add event listener to toggle mode on checkbox change
    modeSwitch1.addEventListener('change', toggleMode1);
    modeSwitch2.addEventListener('change', toggleMode2);
});
