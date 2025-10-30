import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// 1. STATUS DA CÁPSULA (Público)
app.get('/api/capsula-aeon/status', (req, res) => {
  try {
    res.json({
      status: 'active',
      capsula: {
        version: '1.0',
        author: 'Carlos Mascarenhas',
        license: 'Proprietary',
        copyright: '© 2025 Carlos Mascarenhas. All rights reserved.',
        isActive: true,
        usageCount: 0,
        components: ['neuromorphic', 'reinforcement', 'automl', 'behavior', 'knowledge'],
      },
      message: '© 2025 Carlos Mascarenhas. Licensed to Groovia Dashboard.',
    });
  } catch (error) {
    console.error('Erro ao verificar status da Capsula Aeon®:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 2. HEALTH CHECK (Público)
app.get('/api/capsula-aeon/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      version: '1.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Capsula Aeon® indisponível',
    });
  }
});

// 3. MÉTRICAS DE USO (Admin apenas - mock)
app.get('/api/capsula-aeon/metrics', (req, res) => {
  try {
    res.json({
      period: '7d',
      overview: {
        total_operations: 1247,
        total_compute_ms: 45320,
        total_energy_mj: 12.45,
      },
      byComponent: [
        {
          component_name: 'neuromorphic',
          operation_type: 'forward',
          total_operations: 523,
          avg_latency_ms: 34.2,
          total_energy_mj: 5.23,
        },
        {
          component_name: 'reinforcement',
          operation_type: 'update',
          total_operations: 312,
          avg_latency_ms: 28.5,
          total_energy_mj: 3.12,
        },
        {
          component_name: 'automl',
          operation_type: 'optimize',
          total_operations: 156,
          avg_latency_ms: 125.7,
          total_energy_mj: 2.34,
        },
        {
          component_name: 'behavior',
          operation_type: 'encode',
          total_operations: 178,
          avg_latency_ms: 15.3,
          total_energy_mj: 1.12,
        },
        {
          component_name: 'knowledge',
          operation_type: 'embedding',
          total_operations: 78,
          avg_latency_ms: 42.1,
          total_energy_mj: 0.64,
        },
      ],
      copyright: '© 2025 Carlos Mascarenhas',
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🔮 Capsula Aeon® endpoints:`);
  console.log(`   - GET /api/capsula-aeon/health`);
  console.log(`   - GET /api/capsula-aeon/status`);
  console.log(`   - GET /api/capsula-aeon/metrics`);
});

