import logoIcon from './logo.js';
import microphoneIcon from './micro.js';

const text = document.querySelector('.text');
const voiceButton = document.querySelector('.voice-button');

voiceButton.innerHTML = microphoneIcon;
try {
    const recognition = new webkitSpeechRecognition();
    
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    let helpCommandsHtml = null;
    function helpCode() {
        if(helpCommandsHtml) return helpCommandsHtml;

        function inner() {
            const commands = [
                {
                    name: 'logo, hello kottans',
                    description: 'show logo',
                },
                {
                    name: 'close',
                    description: 'show main window',
                },
                {
                    name: 'github',
                    description: 'open developer\'s github page',
                },
                {
                    name: 'map, location, my location',
                    description: 'show your location on the map',
                },
                {
                    name: 'dice',
                    description: 'The game in dice',
                },
                // {
                //     name: 'game',
                //     description: 'play the Memory pair game',
                // },
                {
                    name: 'help, info',
                    description: 'this help',
                },
            ];
            
            const list = commands.reduce((str, current) => {
                const names = current.name.split(', ').map(val => `[ ${ val } ]`).join('<br>');
                str += `<li>
                            <span>${names}</span><br>
                            <span>${current.description}</span>
                        </li>`;
                return str;
            }, '');

            return `
                <h3>List of commands</h3>
                <ul>
                    ${list}
                </ul>
            `;
        }

        helpCommandsHtml = inner();

        return helpCommandsHtml;
    }

    recognition.addEventListener('result', ({ results }) => {
        const wordIndex = results.length - 1;

        if(results[wordIndex].isFinal) {
            const str = results[wordIndex][0].transcript;

            let command = transcript(str);

            const kottansErrors = ['cortana', 'cotons', 'cottons', 'buttons', 'cartoons', 'kittens', 'curtains'];
            if(kottansErrors.includes(command.split(' ')[1])) {
                command = 'hello kottans';
            }

            switch(command) {
                case 'close':
                    close();
                    break;

                case 'help':
                case 'info':
                    help();
                    break;

                case 'logo':
                case 'hello kottans':
                    logo();
                    break;

                case 'my location':
                case 'location':
                case 'map':
                    initMap();
                    break;

                case 'dice':
                case 'yes':
                    diceGame();
                    break;
                
                // case 'game':
                //     window.open('https://merowing.github.io/memory-pair-game/', '_blank');
                //     break;

                case 'github':
                    github();
                    break;

                case 'no':
                default:
                    unrecognized(str);
            }
        }
    });

    recognition.addEventListener('error' , (e) => {
        console.log('error');
        
        let errorMessage = (e.error) ? 
                `
                    <strong>Error:</strong><br>
                    Audio capture blocked
                ` :
                `
                    <strong>Error:</strong><br>
                    Maybe, your browser doesn't support Speech Recognition API.
                `;

        text.innerHTML = errorMessage;
        stop();
    });

    recognition.addEventListener('end', (e) => {
        stop();
    });

    voiceButton.addEventListener('click', () => {
        voiceButton.classList.add('active');
        recognition.start();
    });

    async function diceGame() {
        text.classList.add('game');
        let numbers = [];
        const num = () => Math.round(Math.random() * 100);

        let myNum = num();
        text.innerHTML = myNum.toString();
        numbers.push(myNum);

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        await sleep(2000);
        text.classList.remove('game');
        text.innerHTML = 'my turn';
        
        await sleep(2000);
        const aiNum = num();
        numbers.push(aiNum);
        text.classList.add('game');
        text.innerHTML = aiNum;

        await sleep(2000);
        text.classList.remove('game');
        if(numbers[0] < numbers[1]) {
            text.innerHTML = `You're fool.`;
        }else {
            text.innerHTML = 'Lucky.'
        }
        await sleep(2000);
        text.innerHTML = `
                <strong>Play again?</strong><br>
                Yes or No
            `;
        await sleep(2000);
    }

    function close() {
        text.classList.remove('hidden');
        text.innerHTML = helloScreen();
    }

    function logo() {
        text.classList.remove('hello');
        text.innerHTML = logoIcon;
    }

    function github() {
        window.open('https://github.com/merowing', '_blank');
    }

    function help() {
        text.classList.remove('hello');
        text.innerHTML = helpCode();
    }

    function helloScreen() {
        text.classList.add('hello');
        return `
                <h3>Hi!</h3>
                Tap the microphone icon and<br>
                say <strong>'Help'</strong> to show commands.
            `;
    }
    text.innerHTML = helloScreen();

    function stop() {
        voiceButton.classList.remove('active');

        recognition.stop();
    }

    function unrecognized(str) {
        text.classList.add('hello');
        text.innerHTML = `
                    <span style="color: red;">Unrecognized command.</span>
                    <br>
                    <span>
                        <strong>${str}</strong>
                    </span>
                    <br>
                    <br>
                    <span>Say <strong>'Help'</strong> to show available commands</span>
                `;
    }

    function transcript(str) {
        return str.toLowerCase().match(/[\w\s]+/g)[0];
    }

} catch(error) {
    console.log(error);
    alert(error);
}

function initMap() {
    text.classList.remove('hello');
    text.innerHTML = `<div id="map"></div>`;
    const mapBlock = document.querySelector('#map');

    const map = new google.maps.Map(mapBlock, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    geolocation(map);
}

function geolocation(map) {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            let infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(pos);
            infoWindow.setContent(`You\'re here.`);

            let latlng = new google.maps.LatLng(pos.lat, pos.lng);
            map.setCenter(latlng);
            map.setZoom(8);

            new google.maps.Marker({
                map: map,
                position: latlng,
                title: 'You are here!',
            });

        }, function() {
            alert(`You're block your location or browser doesn't support this api`);
        });
    }else {
        alert(`Geolocation API doesn't support your browser!`);
    }
}
