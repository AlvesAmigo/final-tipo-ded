// =================================================================
// DADOS DO SISTEMA INFLUXO (REGRAS E CLASSES)
// =================================================================

const SYSTEM_DATA = {
    attributes: ["FOR", "DES", "CON", "INT", "SAB", "CAR"],
    attributeScoresPool: [15, 14, 13, 12, 10, 8],
    classes: {
        "Manipulador de Fluxo": {
            bonusAttribute: "INT",
            initialHP: 10, hpPerLevel: 6,
            initialPdH: 5, pdhPerLevel: 3,
            description: "Molda a realidade através da força pura do Fluxo."
        },
        "Evocador de Entidades": {
            bonusAttribute: "SAB",
            initialHP: 12, hpPerLevel: 7,
            initialPdH: 3, pdhPerLevel: 2,
            description: "Traz seres do Fluxo para manifestação física."
        },
        "Especialista": {
            bonusAttribute: "DES",
            initialHP: 14, hpPerLevel: 8,
            initialPdH: 0, pdhPerLevel: 1,
            description: "Usa tecnologia e táticas aprimoradas pelo Fluxo."
        },
        "Combatente do Fluxo": {
            bonusAttribute: "FOR",
            initialHP: 16, hpPerLevel: 10,
            initialPdH: 0, pdhPerLevel: 0,
            description: "Mestre em combate físico, infundindo Fluxo em suas armas."
        }
    },
    origins: {
        "Nômade": { skills: ["Sobrevivência", "Percepção"] },
        "Acadêmico": { skills: ["Conhecimento", "História"] },
        "Militante": { skills: ["Luta", "Intimidação"] }
    }
};

// Variáveis de Estado Global
let currentCharacter = loadCharacter();
let selectedScore = null;


// =================================================================
// FUNÇÕES DE UTILIDADE E CÁLCULO
// =================================================================

/** Calcula o modificador de atributo: (Score - 10) / 2 arredondado para baixo */
function getModifier(score) {
    if (score === undefined || score === null) return 0;
    return Math.floor((score - 10) / 2);
}

/** Salva o estado atual do personagem no localStorage */
function saveCharacter() {
    localStorage.setItem('influxo-character', JSON.stringify(currentCharacter));
}

/** Carrega o personagem do localStorage ou inicia um novo */
function loadCharacter() {
    const saved = localStorage.getItem('influxo-character');
    return saved ? JSON.parse(saved) : {
        name: "",
        class: "",
        origin: "",
        level: 1,
        attrScores: {}, // { FOR: 15, DES: 14, ... }
        hp: 0,
        ca: 0,
        pdh: 0,
        skills: [],
        usedScores: []
    };
}


// =================================================================
// 5. SISTEMA DE ROLAGEM DE DADOS
// =================================================================

/** Rola o dado e registra no histórico */
function rollDice(sides, modifier, label = '') {
    const result = Math.floor(Math.random() * sides) + 1;
    const finalResult = result + modifier;
    
    const historyBox = document.getElementById('roll-history');
    if (!historyBox) return finalResult;

    const rollEntry = document.createElement('div');
    rollEntry.className = 'roll-entry';

    let modText = modifier > 0 ? ` + ${modifier}` : (modifier < 0 ? ` - ${Math.abs(modifier)}` : '');
    let labelText = label ? `[${label}] ` : '';
    let fullRollText = `${labelText}1d${sides}${modText} = ${result}`;

    fullRollText += modifier !== 0 ? ` (Total: ${finalResult})` : ` (Resultado: ${finalResult})`;
    
    rollEntry.textContent = fullRollText;
    historyBox.prepend(rollEntry);

    // Limita o histórico a 10 entradas
    if (historyBox.children.length > 10) {
        historyBox.lastChild.remove();
    }
    
    return finalResult;
}

/** Handler para botões de d4, d6, d20 etc. */
function handleRoll(sides) {
    const modifierInput = document.getElementById('dice-modifier');
    const modifier = parseInt(modifierInput.value) || 0;
    rollDice(sides, modifier, `Rolagem Padrão`);
}

/** Handler para a rolagem com modificador (padrão 1d20) */
function handleCustomRoll() {
    const modifierInput = document.getElementById('dice-modifier');
    const modifier = parseInt(modifierInput.value) || 0;
    rollDice(20, modifier, "1d20 com Modificador");
    // Não limpa o modificador, pois o usuário pode querer rolar várias vezes com o mesmo valor
}


// =================================================================
// SISTEMA DE NAVEGAÇÃO
// =================================================================

const appContainer = document.getElementById('app-container');

const routes = {
    '/': renderHomePage,
    '/create': renderCharacterCreation,
    '/rules': renderRulesPage,
    '/combat-sim': renderCombatSimulator,
    '/fluxo': renderFluxoPage,
    '/sheet': renderCharacterSheet
};

function navigate(path) {
    if (routes[path]) {
        history.pushState(null, '', path);
        routes[path]();
        window.scrollTo(0, 0);
    } else {
        appContainer.innerHTML = '<h2>Página não encontrada</h2><p>Parece que o caminho do Fluxo levou a um vazio.</p>';
    }
}

window.onload = () => {
    window.onpopstate = () => navigate(location.pathname); 
    // Se há um personagem salvo, a home pode ter uma opção 'Ver Ficha'
    if (currentCharacter.name) {
        document.getElementById('app-container').classList.add('has-character');
    }
    navigate(location.pathname === '/' ? '/' : location.pathname);
};


// =================================================================
// 1. PÁGINA INICIAL
// =================================================================

function renderHomePage() {
    appContainer.innerHTML = `
        <div id="home-content">
            <h1>Influxo – A Força da Imaginação</h1>
            <div class="intro-text">
                <p>“Bem-vindos ao mundo de **Influxo**! Aqui, cada ser carrega dentro de si um brilho único... **O Fluxo** é a energia primordial da imaginação, o tecido invisível que conecta todas as coisas. Ele é a própria manifestação da vontade e do pensamento, e aqueles que aprendem a manipulá-lo se tornam verdadeiros arquitetos da realidade. No entanto, o Fluxo é volátil e perigoso, e o universo está cheio de Entidades que são atraídas por seu poder. Você está pronto para dominar a sua essência e moldar o seu próprio destino?”</p>
            </div>
            <div class="button-group">
                <button onclick="navigate('/create')">✨ Criar Personagem</button>
                ${currentCharacter.name ? `<button onclick="navigate('/sheet')">📄 Ver Ficha de ${currentCharacter.name}</button>` : ''}
                <button onclick="navigate('/rules')">📖 Ver Regras</button>
                <button onclick="navigate('/combat-sim')">⚔️ Simulador de Combate</button>
                <button onclick="navigate('/fluxo')">🌀 Sobre o Fluxo</button>
            </div>
        </div>
    `;
}


// =================================================================
// 2. SISTEMA DE CRIAÇÃO DE PERSONAGEM (LÓGICA CORRIGIDA)
// =================================================================

function renderCharacterCreation() {
    // Inicializa ou limpa o personagem para a criação
    currentCharacter = loadCharacter(); // Carrega, mas permite sobrescrever
    
    appContainer.innerHTML = `
        <h2>✨ Criação de Personagem</h2>
        <form id="char-creation-form">
            
            <h3>1. Informações Básicas</h3>
            <label for="char-name">Nome:</label><input type="text" id="char-name" value="${currentCharacter.name}" required><br>
            <label for="char-concept">Conceito Breve:</label><input type="text" id="char-concept" value=""><br>

            <h3>2. Atributos Base (Clique no valor e depois no atributo)</h3>
            <div class="attribute-assignment">
                <div class="score-pool" id="score-pool">
                    <h4>Valores Disponíveis:</h4>
                    </div>
                <div class="attribute-targets" id="attr-targets">
                    ${SYSTEM_DATA.attributes.map(attr => 
                        `<div class="attribute-target" data-attribute="${attr}" onclick="assignAttribute('${attr}')">
                            <label>${attr} (Mod: <span id="mod-${attr}">0</span>)</label>
                            <span class="current-score" id="score-${attr}">?</span>
                        </div>`
                    ).join('')}
                </div>
            </div>

            <h3>3. Classe e Origem</h3>
            <label for="char-class">Classe:</label>
            <select id="char-class" onchange="updateCharacterDetails()">
                <option value="">Selecione uma Classe</option>
                ${Object.keys(SYSTEM_DATA.classes).map(c => 
                    `<option value="${c}" ${currentCharacter.class === c ? 'selected' : ''}>${c}</option>`
                ).join('')}
            </select>
            <p id="class-description"></p>

            <label for="char-origin">Origem:</label>
            <select id="char-origin" onchange="updateCharacterDetails()">
                <option value="">Selecione uma Origem</option>
                ${Object.keys(SYSTEM_DATA.origins).map(o => 
                    `<option value="${o}" ${currentCharacter.origin === o ? 'selected' : ''}>${o}</option>`
                ).join('')}
            </select>
            
            <h3>4. Resumo da Ficha</h3>
            <div style="border: 1px solid var(--color-secondary); padding: 15px;">
                <p><strong>Vida Inicial (HP):</strong> <span id="summary-hp" class="current-score">0</span></p>
                <p><strong>CA (Classe de Armadura):</strong> <span id="summary-ca" class="current-score">10</span></p>
                <p><strong>Pontos de Habilidade (PdH):</strong> <span id="summary-pdh" class="current-score">0</span></p>
                <p><strong>Perícias Iniciais:</strong> <span id="summary-skills">Nenhuma</span></p>
            </div>
            
            <button type="button" onclick="finalizeCharacter()" style="margin-top: 20px;">📄 Gerar Ficha Jogável</button>
        </form>
    `;

    initializeAttributeAssignment();
    updateCharacterDetails(); // Garante que os dados do personagem salvo (se houver) sejam exibidos
}

/** Inicializa o pool de scores e o estado de atribuição */
function initializeAttributeAssignment() {
    const poolEl = document.getElementById('score-pool');
    if (!poolEl) return; // Se não estiver na página de criação
    
    // Recria os botões de scores
    poolEl.innerHTML = `<h4>Valores Disponíveis:</h4>`;
    SYSTEM_DATA.attributeScoresPool.forEach(score => {
        const isUsed = Object.values(currentCharacter.attrScores).includes(score);
        poolEl.innerHTML += `<span class="score-item ${isUsed ? 'used' : ''}" 
                                   data-score="${score}" 
                                   onclick="selectScore(${score})"
                                   style="opacity: ${isUsed ? 0.5 : 1};"
                                >${score}</span>`;
    });

    // Atualiza os alvos de atributo
    SYSTEM_DATA.attributes.forEach(attr => {
        const score = currentCharacter.attrScores[attr];
        const scoreDisplay = document.getElementById(`score-${attr}`);
        const modDisplay = document.getElementById(`mod-${attr}`);
        const targetEl = document.querySelector(`.attribute-target[data-attribute="${attr}"]`);

        if (scoreDisplay) scoreDisplay.textContent = score || '?';
        if (modDisplay) modDisplay.textContent = getModifier(score);
        if (targetEl) targetEl.classList.toggle('assigned', !!score);
    });

    selectedScore = null;
}

/** Seleciona um valor numérico do pool */
function selectScore(score) {
    const item = document.querySelector(`.score-item[data-score="${score}"]:not(.used)`);
    if (!item) return;

    // Remove seleção anterior
    document.querySelectorAll('.score-item.selected').forEach(s => s.classList.remove('selected'));
    
    // Define a nova seleção
    if (selectedScore === score) {
        selectedScore = null; // Deseleciona
    } else {
        item.classList.add('selected');
        selectedScore = score;
    }
}

/** Atribui o score selecionado ao atributo */
function assignAttribute(attr) {
    const targetEl = document.querySelector(`.attribute-target[data-attribute="${attr}"]`);
    const scoreDisplay = document.getElementById(`score-${attr}`);
    const modDisplay = document.getElementById(`mod-${attr}`);
    
    // 1. Tenta ATRIBUIR um novo score
    if (selectedScore !== null) {
        // Se o atributo já tinha um score, 'devolve' o antigo ao pool
        if (currentCharacter.attrScores[attr]) {
            const oldScore = currentCharacter.attrScores[attr];
            const oldItem = document.querySelector(`.score-item[data-score="${oldScore}"]`);
            if (oldItem) oldItem.classList.remove('used');
        }

        // Atribui o novo score e 'usa' ele no pool
        currentCharacter.attrScores[attr] = selectedScore;
        scoreDisplay.textContent = selectedScore;
        modDisplay.textContent = getModifier(selectedScore);
        targetEl.classList.add('assigned');
        
        const newItem = document.querySelector(`.score-item[data-score="${selectedScore}"]`);
        if (newItem) newItem.classList.add('used');

        // Limpa a seleção e atualiza o pool
        document.querySelectorAll('.score-item.selected').forEach(s => s.classList.remove('selected'));
        selectedScore = null;
        
    } else if (currentCharacter.attrScores[attr]) {
        // 2. Se não há score selecionado, remove o score atual (DEVOLVE ao pool)
        const oldScore = currentCharacter.attrScores[attr];
        delete currentCharacter.attrScores[attr];
        scoreDisplay.textContent = '?';
        modDisplay.textContent = 0;
        targetEl.classList.remove('assigned');
        
        const oldItem = document.querySelector(`.score-item[data-score="${oldScore}"]`);
        if (oldItem) oldItem.classList.remove('used');
    }
    
    // Atualiza o CSS do pool e o resumo
    initializeAttributeAssignment();
    updateCharacterDetails();
}

/** Atualiza HP, CA, PdH e Perícias no resumo e no objeto currentCharacter */
function updateCharacterDetails() {
    const charClass = document.getElementById('char-class')?.value;
    const charOrigin = document.getElementById('char-origin')?.value;
    
    currentCharacter.class = charClass;
    currentCharacter.origin = charOrigin;
    
    const conScore = currentCharacter.attrScores["CON"];
    const conMod = getModifier(conScore);
    
    let hp = 0;
    let ca = 10;
    let pdh = 0;
    let skills = 'Nenhuma';
    
    if (charClass && SYSTEM_DATA.classes[charClass]) {
        const classData = SYSTEM_DATA.classes[charClass];
        // HP = HP Inicial da Classe + Modificador de CON
        hp = classData.initialHP + conMod; 
        pdh = classData.initialPdH;
        
        // Exibe descrição da classe
        document.getElementById('class-description').textContent = classData.description;

    } else {
         document.getElementById('class-description').textContent = '';
    }
    
    // CA = 10 (Base) + Modificador de CON (se atribuído)
    ca = 10 + conMod; 

    if (charOrigin && SYSTEM_DATA.origins[charOrigin]) {
        skills = SYSTEM_DATA.origins[charOrigin].skills.join(', ');
        currentCharacter.skills = SYSTEM_DATA.origins[charOrigin].skills;
    } else {
        currentCharacter.skills = [];
    }

    // Atualiza o objeto de estado
    currentCharacter.hp = Math.max(1, hp); // HP mínimo de 1
    currentCharacter.ca = ca;
    currentCharacter.pdh = pdh;

    // Atualiza o resumo visual
    document.getElementById('summary-hp').textContent = currentCharacter.hp;
    document.getElementById('summary-ca').textContent = currentCharacter.ca;
    document.getElementById('summary-pdh').textContent = currentCharacter.pdh;
    document.getElementById('summary-skills').textContent = skills;
}

/** Valida e finaliza a ficha, navegando para a visualização */
function finalizeCharacter() {
    const nameInput = document.getElementById('char-name');
    if (!nameInput.value) {
        alert("🚨 O personagem precisa de um nome!");
        return;
    }
    if (Object.keys(currentCharacter.attrScores).length !== 6) {
        alert("🚨 Por favor, atribua todos os 6 valores de atributo.");
        return;
    }
    if (!currentCharacter.class || !currentCharacter.origin) {
        alert("🚨 Escolha a Classe e a Origem do personagem.");
        return;
    }

    currentCharacter.name = nameInput.value;
    
    // Garante que os cálculos finais estão no objeto
    updateCharacterDetails(); 
    saveCharacter(); // Salva a ficha final
    
    alert(`🎉 Ficha de ${currentCharacter.name} gerada e salva!`);
    navigate('/sheet');
}


// =================================================================
// FICHA DE PERSONAGEM (PÁGINA DEDICADA)
// =================================================================

function renderCharacterSheet() {
    if (!currentCharacter.name) {
        navigate('/create'); // Redireciona se não houver personagem
        return;
    }
    
    const attrList = SYSTEM_DATA.attributes.map(attr => {
        const score = currentCharacter.attrScores[attr] || 0;
        const mod = getModifier(score);
        return `
            <div class="sheet-attr-item">
                <strong>${attr}</strong>
                <div class="sheet-attr-score">${score}</div>
                <small>Mod: ${mod > 0 ? '+' : ''}${mod}</small>
            </div>
        `;
    }).join('');

    appContainer.innerHTML = `
        <h2>📄 Ficha de Personagem: ${currentCharacter.name}</h2>
        <div id="character-sheet-view">
            <h3>Informações Essenciais</h3>
            <p><strong>Classe:</strong> ${currentCharacter.class}</p>
            <p><strong>Origem:</strong> ${currentCharacter.origin}</p>
            <p><strong>Nível:</strong> ${currentCharacter.level}</p>

            <h3>Estatísticas de Combate</h3>
            <p>❤️ **Pontos de Vida (HP):** <span class="current-score">${currentCharacter.hp}</span></p>
            <p>🛡️ **Classe de Armadura (CA):** <span class="current-score">${currentCharacter.ca}</span></p>
            <p>🌀 **Pontos de Habilidade (PdH):** <span class="current-score">${currentCharacter.pdh}</span></p>

            <h3>Atributos</h3>
            <div class="sheet-attributes">${attrList}</div>

            <h3>Perícias e Habilidades</h3>
            <p><strong>Perícias Iniciais:</strong> ${currentCharacter.skills.join(', ') || 'Nenhuma'}</p>
            <p><strong>Habilidades de Classe:</strong> [Detalhes da Classe ${currentCharacter.class} seriam listados aqui]</p>
            
            <h4>Habilidade Única do Fluxo:</h4>
            <textarea placeholder="Escreva a habilidade única do Fluxo aqui..." rows="4" style="width: 90%; background: #000; color: var(--color-text); border: 1px solid var(--color-primary);"></textarea>

            <div style="margin-top: 20px;">
                <button onclick="alert('Funcionalidade de Exportação para PDF/Impressão')">Exportar / Imprimir</button>
                <button onclick="navigate('/')">Voltar</button>
            </div>
        </div>
    `;
}

// =================================================================
// PÁGINAS DE CONTEÚDO (ESQUELETO EXPANDIDO)
// =================================================================

function renderRulesPage() {
    // Conteúdo expandido para as regras solicitadas
    appContainer.innerHTML = `
        <h2>📖 Regras do Sistema Influxo</h2>

        <h3>Atributos Principais</h3>
        <p>FOR, DES, CON, INT, SAB, CAR. O **Modificador** é calculado por **(Atributo - 10) / 2**, arredondado para baixo. É o valor chave para testes e rolagens.</p>
        
        <hr>

        <h3>Secundários e Morte</h3>
        <h4>Quase Morte e Estabilizar</h4>
        <p>Ao atingir 0 HP, o personagem entra em Quase Morte. A cada rodada, faz um Teste de Morte (1d20 + CON). Sucesso: 1 sucesso; Falha: 1 falha. Com 3 falhas, ocorre a **Morte**. Com 3 sucessos, o personagem está **Estabilizado**.</p>
        
        <hr>

        <h3>Tipos de Dano</h3>
        <p>Os Tipos de Dano interagem com diferentes defesas e vulnerabilidades:</p>
        <ul>
            <li>🔥 **Queimadura:** Dano causado por calor intenso (fogo, plasma).</li>
            <li>🔪 **Perfuração:** Dano de ponta (flechas, estocadas finas).</li>
            <li>👊 **Contusão:** Dano de impacto contundente (socos, martelos).</li>
            <li>✂️ **Corte:** Dano de lâmina afiada (espadas, garras).</li>
            <li>💥 **Esmagamento:** Dano de peso extremo ou pressão.</li>
            <li>⚡ **Elétrico:** Dano de corrente ou descarga de energia.</li>
            <li>🧪 **Químico:** Dano de ácidos ou toxinas.</li>
            <li>💣 **Explosão:** Dano de grande área de impacto e calor súbito.</li>
        </ul>

        <hr>

        <h3>Ações de Combate e Condições</h3>
        <h4>Ações de Combate</h4>
        <ul>
            <li>**CA:** Classe de Armadura (10 + Mod. CON). Sua defesa contra ataques.</li>
            <li>**Movimento:** Permite se deslocar dentro do limite (normalmente 6 quadrados).</li>
            <li>**Ação Padrão:** O ataque ou uso de habilidade principal.</li>
            <li>**Ação Livre:** Pequena ação (soltar um item, falar) que não gasta o turno.</li>
            <li>**Rodada Completa:** O turno de todos os participantes.</li>
            <li>**Esquiva:** Ação para aumentar sua CA contra um ataque.</li>
            <li>**Contra-ataque:** Ação de reação para atacar após desviar.</li>
            <li>**Manobras:** Agarrar, Imobilizar, Empurrar, requerem Testes Opostos.</li>
        </ul>
        
        <h4>Condições</h4>
        <p>Condições aplicam penalidades específicas:</p>
        <ul>
            <li>**Agarrado/Imobilizado:** Reduz o movimento ou impede ações.</li>
            <li>**Apavorado/Atordoado:** Impede ações ou impõe desvantagem.</li>
            <li>**Caído:** Ataques corpo a corpo em você têm vantagem.</li>
            <li>**Zonzo:** Desvantagem em testes de ataque e resistência.</li>
        </ul>
        
        <hr>

        <h3>Mecânica de Coreografia</h3>
        <p>A **Coreografia** é uma ação especial onde dois ou mais personagens trabalham juntos para um efeito dramático. Requer que os jogadores descrevam a ação em conjunto e realizem **Testes de Atributo Simultâneos**. Se a maioria for bem-sucedida, o efeito é amplificado, resultando em dano ou efeitos adicionais.</p>
        <div style="border: 1px solid var(--color-primary); padding: 10px; margin-top: 10px;">
            **Exemplo:** Um Combatente e um Manipulador se unem. O Combatente distrai (Teste FOR) enquanto o Manipulador canaliza (Teste INT). Se ambos passarem, o dano é crítico.
        </div>
        
        <button onclick="navigate('/')">Voltar à Home</button>
    `;
}

function renderCombatSimulator() {
     appContainer.innerHTML = `
        <h2>⚔️ Simulador de Combate (Em Construção)</h2>
        <p>Esta seção irá permitir o carregamento de fichas (ou criação rápida de PNJ/NPCs) para simular um encontro, aplicando rolagens de ataque, dano, condições e testes de Coreografia.</p>
        
        <div class="combat-controls">
            <button onclick="alert('Carregar Ficha de Combate')">Carregar Ficha</button>
            <button onclick="alert('Iniciar Coreografia')">Testar Coreografia</button>
        </div>
        
        <div class="combat-log" style="border: 1px solid magenta; padding: 10px; min-height: 200px; margin-top: 20px;">
            <h4>Registro de Turnos</h4>
            <p>O resultado das rolagens e a alteração de HP/Condições serão exibidos aqui.</p>
        </div>
        
        <button onclick="navigate('/')">Voltar à Home</button>
    `;
}

function renderFluxoPage() {
    appContainer.innerHTML = `
        <h2>🌀 O Fluxo – A Força da Imaginação</h2>
        <p>O Fluxo é a fonte de todo o poder. Sua manipulação é regida pela **Vontade** (CAR) e **Conhecimento** (INT).</p>
        
        <h3>Manipulação e Evolução</h3>
        <p>O acesso inicial ao Fluxo depende da Classe. A **Evolução** ocorre através da prática e da realização de feitos épicos que aumentam o **nível de domínio** (PdH) do personagem.</p>
        
        <h3>Riscos e Consequências</h3>
        <p>Usar o Fluxo em excesso ou em estados emocionais instáveis pode levar à **Distorsão**, causando efeitos colaterais imprevisíveis, desde exaustão até mudanças físicas permanentes.</p>
        
        <h3>Personalização da Habilidade Única</h3>
        <p>Cada Manipulador, Evocador ou Combatente tem uma manifestação única do Fluxo. Ela deve ser definida pelo jogador em um formulário guiado que estabelece seu **Nome**, **Efeito**, **Custo em PdH** e **Condição de Uso**.</p>
        
        <button onclick="alert('Abrir Formulário Guiado para Habilidade Única')">✏️ Criar Minha Habilidade do Fluxo</button>
        <button onclick="navigate('/')">Voltar à Home</button>
    `;
}