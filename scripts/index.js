import logoIcon from './logo.js';
import microphoneIcon from './micro.js';

const text = document.querySelector('.text');
//const said = document.querySelector('.said');
const voiceButton = document.querySelector('.voice-button');
//const smallvoiceButton = document.querySelector('.small-voice-button');
//const mapBlock = document.querySelector('#map');

voiceButton.innerHTML = microphoneIcon;
//smallvoiceButton.innerHTML = microphone;

//let errorActive = false;

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
                    name: 'game',
                    description: 'play the Memory pair game',
                },
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

            //said.innerText = str;

            let command = transcript(str);

            const kottansErrors = ['cortana', 'cotons', 'cottons', 'buttons', 'cartoons', 'kittens', 'curtains'];
            if(kottansErrors.includes(command.split(' ')[1])) {
                command = 'hello kottans';
            }

            //text.classList.remove('help');

            switch(command) {
                case 'close':
                    close();
                    break;

                case 'help':
                case 'info':
                    //text.classList.add('help');
                    //text.innerHTML = help();
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
                
                case 'game':
                    window.open('https://merowing.github.io/memory-pair-game/', '_blank');
                    break;

                case 'github':
                    //window.open('https://github.com/merowing', '_blank');
                    github();
                    break;

                default:
                    //voiceButton.classList.remove('hidden');
                    //smallvoiceButton.classList.add('hidden');
                    unrecognized(str);
            }
        }
    });

    recognition.addEventListener('error' , (e) => {
        console.log('error');
        
        errorActive = true;
        let errorMessage = (e.error) ? 
                'Error:<br>Audio capture blocked' :
                'Error:<br>Maybe, your browser doesn\'t support Speech Recognition API.';

        text.innerHTML = errorMessage;
        stop();
    });

    recognition.addEventListener('end', (e) => {
        stop();
    });

    voiceButton.addEventListener('click', () => {
        if(voiceButton.classList.contains('active')) {
           stop();
        }else {
            voiceButton.classList.add('active');
            recognition.start();
        }
    });

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
        return `<h3>Hi!</h3>Tap the microphone icon and<br> say <strong>'Help'</strong> to show commands.`;
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
        //const index = results.length - 1;
        //const str = results[index][0].transcript.toLowerCase();

        return str.toLowerCase().match(/[\w\s]+/g)[0];
    }

} catch(error) {
    console.log(error);
    alert(error);
}

function initMap() {
    text.innerHTML = `<div id="map"></div>`;
    text.classList.remove('hello');
    //mapBlock.classList.remove('hidden');
    //text.classList.add('hidden');
    //smallvoiceButton.classList.remove('hidden');

    const map = new google.maps.Map(document.querySelector('#map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    //text.innerHTML = '';
    text.innerHTML = objToString(map);

    let geocoder = new google.maps.Geocoder();
    let location = "Ukraine";
    geocoder.geocode({ 'address': location }, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            alert("Could not find location: " + location);
        }
    });

    //geolocation(map);
}

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

// window.initMap = initMap;

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
