# 🔮 Capsula Aeon® - README Rápido

## O que é?

**Capsula Aeon®** é o núcleo de inteligência artificial do Groovia Dashboard, desenvolvido e licenciado por **Carlos Mascarenhas**.

---

## ⚡ Acesso Rápido

### Via Web (Admin)
```
1. Login → Menu Lateral → "Sistema Avançado" → "Capsula Aeon®"
```

### Via API
```bash
# Health Check
curl http://localhost:3000/api/capsula-aeon/health

# Status Completo
curl http://localhost:3000/api/capsula-aeon/status

# Métricas (requer autenticação admin)
curl -H "x-session-token: TOKEN" \
     -H "x-user-id: ID" \
     -H "x-client-id: CLIENT_ID" \
     http://localhost:3000/api/capsula-aeon/metrics
```

---

## 📦 Componentes

| Componente | Descrição | Ícone |
|------------|-----------|-------|
| **Neuromorphic** | Spike-timing Dependent Plasticity | 🧠 |
| **Reinforcement** | Deep Reinforcement Learning (PPO) | 🎯 |
| **AutoML** | Hyperparameter Optimization | 🔬 |
| **Behavior** | Internet of Behaviors (IoB) | 📊 |
| **Knowledge** | Semantic Knowledge Graph | 🌐 |
| **Dynamic Templates** | Adaptive Content Generation | 📝 |

---

## 🔐 Licença

**Proprietário:** Carlos Mascarenhas  
**Tipo:** Não exclusiva, não transferível, perpétua  
**Uso:** Exclusivo para Groovia Dashboard  

Ver documento completo: [`LICENSE_CAPSULA_AEON.md`](./LICENSE_CAPSULA_AEON.md)

---

## 📚 Documentação Completa

- **Licença:** `LICENSE_CAPSULA_AEON.md`
- **Integração:** `CAPSULA_AEON_INTEGRATION.md`
- **Este README:** `CAPSULA_AEON_README.md`

---

## ⚠️ Avisos

- ❌ **NÃO** redistribuir ou sublicenciar
- ❌ **NÃO** realizar engenharia reversa
- ❌ **NÃO** remover avisos de copyright
- ✅ **SIM** usar para potencializar os agentes do Groovia
- ✅ **SIM** monitorar métricas e performance

---

## 🎉 Status

```
✅ Backend API: FUNCIONANDO
✅ Frontend Dashboard: FUNCIONANDO
✅ Licença: ATIVA
✅ Documentação: COMPLETA
```

---

**© 2025 Carlos Mascarenhas. All rights reserved.**  
**Capsula Aeon®** is a registered trademark.

