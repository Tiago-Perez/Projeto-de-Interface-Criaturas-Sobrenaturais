// ==========================================================
// BESTARALHO - comportamentos compartilhados pelas duas páginas
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    iniciarMenu();
    iniciarVoltarTopo();
    iniciarFallbackImagens();
    iniciarBusca();
    iniciarAtalhosAtivos();
});

// ---------- Menu hambúrguer (celular) ----------
function iniciarMenu() {
    const botao = document.getElementById('btn-menu');
    const menu = document.getElementById('menu');
    if (!botao || !menu) return;

    function alternar(abrir) {
        menu.classList.toggle('aberto', abrir);
        botao.setAttribute('aria-expanded', String(abrir));
        botao.textContent = abrir ? '✕' : '☰';
    }

    botao.addEventListener('click', () => {
        alternar(!menu.classList.contains('aberto'));
    });

    // Esc fecha o menu e devolve o foco ao botão
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('aberto')) {
            alternar(false);
            botao.focus();
        }
    });
}

// ---------- Botão "voltar ao topo" ----------
function iniciarVoltarTopo() {
    const botao = document.getElementById('voltar-topo');
    if (!botao) return;

    window.addEventListener('scroll', () => {
        botao.classList.toggle('visivel', window.scrollY > 500);
    }, { passive: true });

    botao.addEventListener('click', () => {
        window.scrollTo({ top: 0 });
        document.body.focus?.();
    });
}

// ---------- Se uma imagem falhar, a interface continua legível ----------
function iniciarFallbackImagens() {
    document.querySelectorAll('img').forEach((img) => {
        img.addEventListener('error', () => {
            img.style.minHeight = '120px';
            img.style.objectFit = 'contain';
            img.style.color = '#c9ced4';
            img.style.fontSize = '0.9rem';
            img.style.padding = '12px';
        });
    });
}

// ---------- Busca por nome/categoria (página de monstros) ----------
function iniciarBusca() {
    const campo = document.getElementById('busca');
    const cards = document.querySelectorAll('.card-monstro');
    if (!campo || cards.length === 0) return;

    const status = document.getElementById('status-busca');
    const vazio = document.getElementById('sem-resultados');
    const atalhos = document.querySelectorAll('.atalhos li');

    // remove acentos e deixa minúsculo: "Demônio" == "demonio"
    const normalizar = (texto) =>
        texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function filtrar() {
        const termo = normalizar(campo.value.trim());
        let visiveis = 0;

        cards.forEach((card, i) => {
            const alvo = normalizar(card.dataset.busca || card.textContent);
            const mostrar = alvo.includes(termo);
            card.hidden = !mostrar;
            if (atalhos[i]) atalhos[i].hidden = !mostrar;
            if (mostrar) visiveis++;
        });

        vazio.hidden = visiveis !== 0;
        status.textContent = termo === ''
            ? `Mostrando as ${cards.length} criaturas do catálogo.`
            : `Mostrando ${visiveis} de ${cards.length} criaturas.`;
    }

    campo.addEventListener('input', filtrar);
    document.getElementById('limpar-busca')?.addEventListener('click', () => {
        campo.value = '';
        filtrar();
        campo.focus();
    });
    filtrar();
}

// ---------- Destaca no atalho a criatura que está na tela ----------
function iniciarAtalhosAtivos() {
    const links = document.querySelectorAll('.atalhos a');
    const cards = document.querySelectorAll('.card-monstro');
    if (links.length === 0 || !('IntersectionObserver' in window)) return;

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            links.forEach((link) => {
                const ativo = link.getAttribute('href') === `#${entrada.target.id}`;
                link.classList.toggle('ativo', ativo);
                if (ativo) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-35% 0px -55% 0px' });

    cards.forEach((card) => observador.observe(card));
}
