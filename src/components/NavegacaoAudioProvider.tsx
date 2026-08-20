import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { NavegacaoAudioContext } from "./NavegacaoAudioContext";

const CHAVE_NAVEGACAO_AUDIO = "fala-pommer:navegacao-audio";
const ATRASO_LEITURA_MS = 400;
const SELETOR_ELEMENTO_FALAVEL = [
    "[data-audio-text]",
    "[aria-label]",
    "button",
    "a",
    "input",
    "select",
    "textarea",
    "label",
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "strong",
    "span",
    "li",
    "td",
    "th",
].join(",");

function normalizarTexto(texto: string | null | undefined) {
    return texto?.replace(/\s+/g, " ").trim() ?? "";
}

function obterTextoDoElemento(elemento: Element) {
    const textoDefinido = normalizarTexto(elemento.getAttribute("data-audio-text"));
    if (textoDefinido) return textoDefinido;

    const rotulo = normalizarTexto(elemento.getAttribute("aria-label"));
    if (rotulo) return rotulo;

    if (elemento instanceof HTMLImageElement) {
        return normalizarTexto(elemento.alt);
    }

    if (elemento instanceof HTMLSelectElement) {
        return normalizarTexto(elemento.selectedOptions[0]?.text);
    }

    if (elemento instanceof HTMLInputElement || elemento instanceof HTMLTextAreaElement) {
        return normalizarTexto(elemento.placeholder || elemento.title);
    }

    if (elemento instanceof HTMLElement) {
        return normalizarTexto(elemento.innerText || elemento.title);
    }

    return normalizarTexto(elemento.textContent);
}

function encontrarElementoFalavel(inicial: Element) {
    let elemento: Element | null = inicial;

    while (elemento && elemento !== document.body) {
        const ancestralOculto: Element | null = elemento.closest('[aria-hidden="true"]');

        if (ancestralOculto) {
            elemento = ancestralOculto.parentElement;
            continue;
        }

        if (elemento.matches(SELETOR_ELEMENTO_FALAVEL)) {
            const texto = obterTextoDoElemento(elemento);

            if (texto) {
                return { elemento, texto };
            }
        }

        elemento = elemento.parentElement;
    }

    return null;
}

export function NavegacaoAudioProvider({ children }: PropsWithChildren) {
    const [navegacaoAudioAtiva, setNavegacaoAudioAtiva] = useState(() =>
        localStorage.getItem(CHAVE_NAVEGACAO_AUDIO) === "true"
    );
    const temporizadorRef = useRef<number | null>(null);
    const elementoAtivoRef = useRef<Element | null>(null);
    const textoAtivoRef = useRef("");

    useEffect(() => {
        localStorage.setItem(CHAVE_NAVEGACAO_AUDIO, String(navegacaoAudioAtiva));
    }, [navegacaoAudioAtiva]);

    useEffect(() => {
        if (!navegacaoAudioAtiva || !("speechSynthesis" in window)) return;

        const limparLeitura = () => {
            if (temporizadorRef.current !== null) {
                window.clearTimeout(temporizadorRef.current);
                temporizadorRef.current = null;
            }

            window.speechSynthesis.cancel();
            elementoAtivoRef.current = null;
            textoAtivoRef.current = "";
        };

        const aoEntrarNoElemento = (evento: PointerEvent) => {
            if (evento.pointerType === "touch" || !(evento.target instanceof Element)) return;

            const resultado = encontrarElementoFalavel(evento.target);

            if (!resultado) {
                limparLeitura();
                return;
            }

            if (
                resultado.elemento === elementoAtivoRef.current &&
                resultado.texto === textoAtivoRef.current
            ) {
                return;
            }

            limparLeitura();
            elementoAtivoRef.current = resultado.elemento;
            textoAtivoRef.current = resultado.texto;

            temporizadorRef.current = window.setTimeout(() => {
                const fala = new SpeechSynthesisUtterance(resultado.texto);
                fala.lang = "pt-BR";
                fala.rate = 0.95;
                window.speechSynthesis.speak(fala);
                temporizadorRef.current = null;
            }, ATRASO_LEITURA_MS);
        };

        const aoSairDoElemento = (evento: PointerEvent) => {
            const elementoAtivo = elementoAtivoRef.current;

            if (!elementoAtivo) return;
            if (evento.relatedTarget instanceof Node && elementoAtivo.contains(evento.relatedTarget)) {
                return;
            }

            limparLeitura();
        };

        document.addEventListener("pointerover", aoEntrarNoElemento);
        document.addEventListener("pointerout", aoSairDoElemento);

        return () => {
            document.removeEventListener("pointerover", aoEntrarNoElemento);
            document.removeEventListener("pointerout", aoSairDoElemento);
            limparLeitura();
        };
    }, [navegacaoAudioAtiva]);

    const contexto = useMemo(
        () => ({ navegacaoAudioAtiva, setNavegacaoAudioAtiva }),
        [navegacaoAudioAtiva]
    );

    return (
        <NavegacaoAudioContext.Provider value={contexto}>
            {children}
        </NavegacaoAudioContext.Provider>
    );
}
