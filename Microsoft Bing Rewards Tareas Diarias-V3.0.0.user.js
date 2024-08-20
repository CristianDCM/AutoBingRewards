// ==UserScript==
// @name         Microsoft Bing Rewards Tareas Diarias
// @version      V3.0.0
// @description  Completa automáticamente las tareas diarias de Microsoft Rewards, obteniendo palabras clave populares de varias fuentes para evitar el uso repetido y posibles bloqueos.
// @note         Actualizado en 2024-08-20
// @author       Cristian DCM
// @match        https://www.bing.com/*
// @match        https://www.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @connect      gumengya.com
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @namespace    https://greasyfork.org/zh-CN/scripts/477107
// @downloadURL https://update.greasyfork.org/scripts/477107/Microsoft%20Bing%20Rewards%E6%AF%8F%E6%97%A5%E4%BB%BB%E5%8A%A1%E8%84%9A%E6%9C%AC.user.js
// @updateURL https://update.greasyfork.org/scripts/477107/Microsoft%20Bing%20Rewards%E6%AF%8F%E6%97%A5%E4%BB%BB%E5%8A%A1%E8%84%9A%E6%9C%AC.meta.js
// ==/UserScript==

var max_rewards = 40; // Número de veces que se ejecutará
var pause_time = 600000; // Tiempo de pausa recomendado: 10 minutos (600000 ms)
var search_words = []; // Palabras clave

// Palabras clave predeterminadas, usadas si no se pueden obtener las palabras populares
var default_search_words = [
    "La juventud no vuelve, un día no se repite en la mañana",
    "Un viaje de mil millas comienza con un solo paso",
    "El aprendizaje es fácil en la juventud, difícil en la vejez, el tiempo es oro",
    "Sé rápido para aprender, no te avergüences de preguntar",
    "Un amigo en todo el mundo, la distancia no importa",
    "Tres personas caminan, siempre hay un maestro entre ellos",
    "No te preocupes por el futuro sin amigos, todo el mundo te conoce",
    "La vida es preciosa, ¿por qué necesitar oro y plata?",
    "Nací para ser útil",
    "Un mar grande abarca todos los ríos; un alto muro se mantiene fuerte sin deseos",
    "En la pobreza, cuida de ti mismo; en la prosperidad, ayuda al mundo",
    "Leer miles de libros, escribir como un dios",
    "Aprender sin pensar es inútil, pensar sin aprender es peligroso",
    "Un año se planifica en primavera, un día se planifica en la mañana",
    "No esperes, que la juventud se desvanezca, solo queda el lamento",
    "El que no trabaja en la juventud, lamenta en la vejez",
    "El tiempo es oro, no se puede comprar",
    "Cercanía al rojo, cercanía al negro",
    "Mi vida tiene un límite, pero el conocimiento no",
    "El conocimiento teórico se obtiene en los libros, pero para comprenderlo, hay que aplicarlo",
    "El aprendizaje no tiene fin",
    "No hagas a los demás lo que no quieres para ti",
    "El cielo otorga grandes responsabilidades a quienes soportan el peso",
    "Haz todo lo que puedas, hasta la muerte",
    "Cuando te falta un libro, te arrepientes",
    "La prosperidad y la decadencia de un país es responsabilidad de todos",
    "Quien no piensa en el futuro, tiene preocupaciones cercanas",
    "Estudia para el resurgimiento de China",
    "Un día sin leer, cien tareas abandonadas",
    "No siempre se puede complacer a todos, pero actúa sin remordimientos",
    "Desde la antigüedad, ¿quién no ha muerto? Deja tu corazón en la historia",
    "Mi vida es limitada, pero el conocimiento es ilimitado",
    "Nacer en dificultades, morir en la comodidad",
    "Decir la verdad, cumplir la acción",
    "Leer miles de libros, escribir como un dios",
    "Un hombre virtuoso vive con tranquilidad y moderación",
    "El viejo caballo sigue en el establo, su ambición sigue siendo grande",
    "Un día sin leer, el pecho carece de ideas",
    "¿Los nobles y reyes nacen de una semilla?",
    "La calma lleva a la distancia, la tranquilidad lleva a la ambición"
];

var keywords_source = ['GoogleTrendsES', 'TwitterTrendsES'];
var random_keywords_source = keywords_source[Math.floor(Math.random() * keywords_source.length)];
var current_source_index = 0; // Índice actual de la fuente de palabras clave

async function douyinhot_dic() {
    while (current_source_index < keywords_source.length) {
        const source = keywords_source[current_source_index];
        try {
            const response = await fetch("https://api.gumengya.com/Api/" + source);
            if (!response.ok) {
                throw new Error('¡Error de HTTP! Estado: ' + response.status);
            }
            const data = await response.json();

            if (data.data.some(item => item)) {
                const names = data.data.map(item => item.title);
                return names;
            }
        } catch (error) {
            console.error('Error en la solicitud de la fuente de palabras clave:', error);
        }
        current_source_index++;
    }
    console.error('Error en todas las fuentes de palabras clave');
    return default_search_words;
}

douyinhot_dic()
    .then(names => {
        search_words = names;
        exec();
    })
    .catch(error => {
        console.error(error);
    });

let menu1 = GM_registerMenuCommand('Iniciar', function () {
    GM_setValue('Cnt', 0);
    location.href = "https://www.bing.com/?br_msg=Please-Wait";
}, 'o');

let menu2 = GM_registerMenuCommand('Detener', function () {
    GM_setValue('Cnt', max_rewards + 10);
}, 'o');

function AutoStrTrans(st) {
    let yStr = st;
    let rStr = "";
    let zStr = "";
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1;
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr;
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo);
    }
    return zStr;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    let randomDelay = Math.floor(Math.random() * 20000) + 10000;
    let randomString = generateRandomString(4);
    let randomCvid = generateRandomString(32);

    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    let currentSearchCount = GM_getValue('Cnt');

    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML;

        setTimeout(function () {
            GM_setValue('Cnt', currentSearchCount + 1);
            let nowtxt = search_words[currentSearchCount];
            nowtxt = AutoStrTrans(nowtxt);

            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function() {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid;
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
}