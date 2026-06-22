/* ── API (backend FastAPI) ────────── */
// Troque pela URL do seu backend depois do deploy (ex: Render).
const API_URL = "https://bari-backend-3zcp.onrender.com";

async function enviarLead(dados){
  try{
    const resp = await fetch(`${API_URL}/api/leads`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(dados)
    });
    if(!resp.ok){
      console.error('API recusou os dados:', resp.status, await resp.text());
    }
  } catch(err){
    // Falha de rede não deve impedir o usuário de ver o resultado dele.
    console.error('Não foi possível salvar o lead:', err);
  }
}

/* ── MODAL ────────────────────────── */
function openModal(){
  document.getElementById('modal').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow='';
}
window.addEventListener('click',e=>{
  if(e.target===document.getElementById('modal')) closeModal();
});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeModal();
});

/* ── FAQ ──────────────────────────── */
function toggleFaq(el){
  const a=el.nextElementSibling;
  const isOpen=a.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(x=>x.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(x=>x.classList.remove('open'));
  if(!isOpen){a.classList.add('open');el.classList.add('open');}
}

/* ── IMC HELPERS ─────────────────── */
function getGrauObesidade(imc){
  if(imc<18.5) return "Abaixo do peso";
  if(imc<25) return "Peso normal";
  if(imc<30) return "Sobrepeso";
  if(imc<35) return "Obesidade Grau I";
  if(imc<40) return "Obesidade Grau II";
  return "Obesidade Grau III (Mórbida)";
}

function updateGrauInfo(){
  const peso=parseFloat(document.getElementById('peso')?.value);
  const alt=parseFloat(document.getElementById('altura')?.value);
  const el=document.getElementById('grauInfo');
  if(peso>0 && alt>0){
    const imc=peso/((alt/100)**2);
    if(!isNaN(imc) && isFinite(imc)){
      el.innerHTML=`📊 Classificação: <strong>${getGrauObesidade(imc)}</strong> &nbsp;·&nbsp; IMC: <strong>${imc.toFixed(1)}</strong>`;
    }
  } else {
    el.innerHTML=`Preencha peso e altura para ver sua classificação`;
  }
}
document.getElementById('peso')?.addEventListener('input',updateGrauInfo);
document.getElementById('altura')?.addEventListener('input',updateGrauInfo);

/* ── MÁSCARA WHATSAPP (somente números) ───────── */
function maskPhone(value){
  let v=value.replace(/\D/g,'').slice(0,11); // remove tudo que não é dígito, máx 11 dígitos
  if(v.length>10){
    v=v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,'($1) $2-$3');
  } else if(v.length>6){
    v=v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,'($1) $2-$3');
  } else if(v.length>2){
    v=v.replace(/^(\d{2})(\d{0,5})/,'($1) $2');
  } else if(v.length>0){
    v=v.replace(/^(\d*)/,'($1');
  }
  return v;
}
const whatsappInput=document.getElementById('whatsapp');
if(whatsappInput){
  whatsappInput.setAttribute('inputmode','numeric');
  whatsappInput.setAttribute('maxlength','15');
  whatsappInput.addEventListener('input',e=>{
    e.target.value=maskPhone(e.target.value);
  });
  whatsappInput.addEventListener('keypress',e=>{
    if(!/[0-9]/.test(e.key)){e.preventDefault();}
  });
  whatsappInput.addEventListener('paste',e=>{
    e.preventDefault();
    const texto=(e.clipboardData||window.clipboardData).getData('text');
    e.target.value=maskPhone(texto);
  });
}

/* ── CALCULAR ─────────────────────── */
function calcularResultado(){
  const nome=document.getElementById('nome').value.trim();
  const whatsapp=document.getElementById('whatsapp').value.trim();
  const peso=parseFloat(document.getElementById('peso').value);
  const alturaCm=parseFloat(document.getElementById('altura').value);
  const idade=parseInt(document.getElementById('idade').value);
  const diabetes=document.getElementById('diabetes').value;
  const hipertensao=document.getElementById('hipertensao').value;

  if(!nome){alert("Por favor, informe seu nome");return;}
  const whatsappDigits=whatsapp.replace(/\D/g,'');
  if(!whatsapp){alert("Por favor, informe seu WhatsApp");return;}
  if(whatsappDigits.length<10||whatsappDigits.length>11){alert("Por favor, informe um WhatsApp válido com DDD. Ex: (11) 99999-9999");return;}
  if(isNaN(peso)||peso<30||peso>400){alert("Por favor, informe um peso válido (30 a 400 kg)");return;}
  if(isNaN(alturaCm)||alturaCm<100||alturaCm>250){alert("Por favor, informe uma altura válida (100 a 250 cm)");return;}
  if(isNaN(idade)||idade<16||idade>100){alert("Por favor, informe uma idade válida (16 a 100 anos)");return;}

  const altM=alturaCm/100;
  const imc=peso/(altM*altM);
  const imcF=imc.toFixed(1);
  const piMin=(18.5*altM*altM).toFixed(0);
  const piMax=(24.9*altM*altM).toFixed(0);
  const piMed=((+piMin+(+piMax))/2).toFixed(0);
  const excesso=(peso-+piMed).toFixed(0);
  const comorbidade=(diabetes==='sim'||hipertensao==='sim');

  let prob=0, msg='', badge='';

  if(imc>=40){
    prob=95; badge='✓ Alto risco — Indicado';
    msg=`✅ <strong>Seu IMC é ${imcF} — Obesidade Grau III (Mórbida).</strong> Você se enquadra nos critérios tradicionais para cirurgia bariátrica, independentemente de comorbidades. Procure um especialista para avaliação completa.`;
  } else if(imc>=35){
    if(comorbidade){
      prob=85; badge='✓ Forte indicativo';
      msg=`✅ <strong>Seu IMC é ${imcF} — Obesidade Grau II com comorbidades.</strong> A presença de comorbidades fortalece a indicação para cirurgia bariátrica. Consulte um médico especialista.`;
    } else {
      prob=60; badge='⚠️ Avaliação necessária';
      msg=`⚠️ <strong>Seu IMC é ${imcF} — Obesidade Grau II.</strong> Sem comorbidades, uma avaliação médica detalhada é essencial para entender suas opções cirúrgicas.`;
    }
  } else if(imc>=30){
    if(comorbidade&&diabetes==='sim'){
      prob=50; badge='🔍 Avaliar com médico';
      msg=`📋 <strong>Seu IMC é ${imcF} — Obesidade Grau I com diabetes.</strong> Em casos específicos de diabetes de difícil controle, a cirurgia pode ser considerada. Converse com um endocrinologista.`;
    } else {
      prob=25; badge='ℹ️ Baixa prioridade';
      msg=`ℹ️ <strong>Seu IMC é ${imcF} — Obesidade Grau I.</strong> Os critérios tradicionais indicam tratamento clínico inicial. Programas de reeducação alimentar e exercícios são o primeiro passo.`;
    }
  } else if(imc>=25){
    prob=15; badge='ℹ️ Acompanhamento nutricional';
    msg=`ℹ️ <strong>Seu IMC é ${imcF} — Sobrepeso.</strong> Os critérios para bariátrica geralmente exigem IMC ≥35 com comorbidades ou ≥40 sem. Busque orientação nutricional.`;
  } else {
    prob=5; badge='✅ Peso saudável';
    msg=`✅ <strong>Seu IMC é ${imcF} — Peso normal.</strong> Parabéns! Seu peso está dentro da faixa considerada saudável. Continue mantendo hábitos saudáveis.`;
  }

  document.getElementById('resultNome').innerHTML=`Olá, ${nome} 👋`;
  document.getElementById('resultDados').innerHTML=`Peso: ${peso} kg · Altura: ${alturaCm} cm · IMC: ${imcF}`;
  document.getElementById('resultBadge').innerHTML=badge;
  document.getElementById('imcValor').innerHTML=imcF;
  document.getElementById('pesoIdealValor').innerHTML=`${piMed} kg`;
  document.getElementById('excessoValor').innerHTML=`${excesso} kg`;
  document.getElementById('probabilidadeText').innerHTML=prob>=70?'Alta probabilidade':(prob>=40?'Prob. moderada':'Baixa probabilidade');
  document.getElementById('progressFill').style.width='0%';
  document.getElementById('resultMsg').innerHTML=msg;

  enviarLead({
    nome,
    whatsapp: whatsappDigits,
    peso,
    altura: alturaCm,
    idade,
    diabetes: diabetes==='sim',
    hipertensao: hipertensao==='sim',
    imc: parseFloat(imcF),
    classificacao: getGrauObesidade(imc),
    probabilidade: prob
  });

  closeModal();
  document.getElementById('resultado').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>{document.getElementById('progressFill').style.width=`${prob}%`;},400);
}

/* ── SCROLL ANIMATIONS ─────────────── */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
},{threshold:.1});
document.querySelectorAll('.animate').forEach(el=>observer.observe(el));
