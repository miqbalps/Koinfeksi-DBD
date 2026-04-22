// ============================================
// INFERENCE ENGINE - Hybrid (Bayes + Rule-Based)
// ============================================

import { 
  PRIOR_PROBABILITY, 
  LIKELIHOOD, 
  RULES,
  HYPOTHESIS_NAMES 
} from './data.js';

/**
 * Bayesian Inference Calculator
 * Menghitung probabilitas posterior menggunakan Teorema Bayes
 */
export class BayesianInference {
  constructor(prior, likelihood) {
    this.prior = prior;
    this.likelihood = likelihood;
  }

  /**
   * Menghitung posterior probability
   * @param {Array} selectedSymptoms - Array kode gejala yang dipilih
   * @returns {Object} Hasil perhitungan Bayes
   */
  calculate(selectedSymptoms) {
    // Inisialisasi dengan prior
    let H1 = this.prior.H1;
    let H2 = this.prior.H2;
    let H3 = this.prior.H3;

    // Array untuk tracking langkah perhitungan
    const steps = {
      H1: [this.prior.H1],
      H2: [this.prior.H2],
      H3: [this.prior.H3]
    };

    // Kalikan dengan likelihood untuk setiap gejala yang dipilih
    selectedSymptoms.forEach(symptom => {
      const likelihoodValues = this.likelihood[symptom];
      if (likelihoodValues) {
        H1 *= likelihoodValues[0];
        H2 *= likelihoodValues[1];
        H3 *= likelihoodValues[2];
        
        steps.H1.push(likelihoodValues[0]);
        steps.H2.push(likelihoodValues[1]);
        steps.H3.push(likelihoodValues[2]);
      }
    });

    // Total evidence (normalisasi)
    const totalEvidence = H1 + H2 + H3;

    // Posterior probabilities
    const posterior = {
      H1: H1 / totalEvidence,
      H2: H2 / totalEvidence,
      H3: H3 / totalEvidence
    };

    return {
      posterior,
      rawValues: { H1, H2, H3 },
      totalEvidence,
      steps,
      selectedSymptoms
    };
  }

  /**
   * Format steps untuk ditampilkan
   */
  formatSteps(steps) {
    return {
      H1: steps.H1.map(v => this.formatNumber(v)).join(' × '),
      H2: steps.H2.map(v => this.formatNumber(v)).join(' × '),
      H3: steps.H3.map(v => this.formatNumber(v)).join(' × ')
    };
  }

  formatNumber(num) {
    if (num === 0) return '0';
    if (num < 0.001) return num.toExponential(3);
    return num.toFixed(4).replace(/\.?0+$/, '');
  }
}

/**
 * Rule-Based Engine
 * Mendeteksi pola spesifik berdasarkan aturan deterministik
 */
export class RuleBasedEngine {
  constructor(rules) {
    this.rules = rules;
  }

  /**
   * Cek apakah ada rule yang terpenuhi
   * @param {Array} selectedSymptoms - Array kode gejala
   * @returns {Object|null} Rule yang terpenuhi atau null
   */
  checkRules(selectedSymptoms) {
    for (const rule of this.rules) {
      // Cek semua required symptoms ada
      const hasRequired = rule.required.every(s => selectedSymptoms.includes(s));
      
      // Cek tidak ada excluded symptoms
      const noExcluded = rule.excluded.every(s => !selectedSymptoms.includes(s));
      
      if (hasRequired && noExcluded) {
        return {
          ...rule,
          matched: true
        };
      }
    }
    return null;
  }

  /**
   * Dapatkan semua rule yang applicable
   */
  getAllRules() {
    return this.rules;
  }
}

/**
 * Hybrid Inference Engine
 * Menggabungkan Bayes dan Rule-Based
 */
export class HybridInferenceEngine {
  constructor() {
    this.bayesEngine = new BayesianInference(PRIOR_PROBABILITY, LIKELIHOOD);
    this.ruleEngine = new RuleBasedEngine(RULES);
  }

  /**
   * Jalankan inferensi hybrid
   */
  diagnose(selectedSymptoms) {
    // Bayesian inference
    const bayesResult = this.bayesEngine.calculate(selectedSymptoms);
    
    // Rule-based check
    const ruleResult = this.ruleEngine.checkRules(selectedSymptoms);
    
    // Tentukan diagnosa final
    const maxProb = Math.max(
      bayesResult.posterior.H1,
      bayesResult.posterior.H2,
      bayesResult.posterior.H3
    );
    
    let finalDiagnosis;
    if (maxProb === bayesResult.posterior.H1) {
      finalDiagnosis = HYPOTHESIS_NAMES.H1;
    } else if (maxProb === bayesResult.posterior.H2) {
      finalDiagnosis = HYPOTHESIS_NAMES.H2;
    } else {
      finalDiagnosis = HYPOTHESIS_NAMES.H3;
    }

    // Cek konsistensi dengan rule
    let consistency = null;
    if (ruleResult) {
      consistency = {
        ruleDiagnosis: ruleResult.name,
        bayesDiagnosis: finalDiagnosis,
        isConsistent: ruleResult.name === finalDiagnosis
      };
    }

    return {
      bayes: bayesResult,
      rule: ruleResult,
      finalDiagnosis,
      consistency,
      confidence: maxProb
    };
  }

  /**
   * Format hasil untuk tampilan
   */
  formatResult(result) {
    const { bayes, rule, finalDiagnosis, consistency, confidence } = result;
    
    return {
      diagnosis: finalDiagnosis,
      confidence: (confidence * 100).toFixed(2),
      probabilities: {
        dengue: (bayes.posterior.H1 * 100).toFixed(2),
        tifoid: (bayes.posterior.H2 * 100).toFixed(2),
        malaria: (bayes.posterior.H3 * 100).toFixed(4)
      },
      ruleMatched: rule ? rule.name : null,
      ruleDescription: rule ? rule.description : null,
      isConsistent: consistency ? consistency.isConsistent : null,
      steps: this.bayesEngine.formatSteps(bayes.steps),
      rawValues: {
        H1: bayes.rawValues.H1,
        H2: bayes.rawValues.H2,
        H3: bayes.rawValues.H3,
        total: bayes.totalEvidence
      }
    };
  }
}

// Export singleton instance
export const inferenceEngine = new HybridInferenceEngine();