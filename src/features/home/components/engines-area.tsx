import React from 'react';
import Image from 'next/image';
import RightSymbol from '@/components/icons/right-symbol';
import { useT } from '@/i18n';
import type { Engine } from '../types/home';

const engines_data: Engine[] = [
    {
        num: '01',
        img: '/assets/img/engines/data-engine.png',
        title: 'Data Engine',
        tagline: 'Turn raw data into AI-ready data.',
        description: 'Discover, collect, clean, curate, annotate, and validate data from your own sources and available public datasets.',
        features: ['Data Discovery', 'Data Collection', 'Data Curation', 'Data Annotation', 'Quality Control', 'Dataset Versioning'],
    },
    {
        num: '02',
        img: '/assets/img/engines/community.png',
        title: 'Community',
        tagline: 'Scale human intelligence when AI needs people.',
        description: 'Connect your AI projects with a community of contributors, specialists, and evaluators to handle data and AI tasks at scale.',
        features: ['Data Contributors', 'AI Evaluators', 'Specialists', 'Quality Reviewers', 'Distributed Workforce', 'Reputation System'],
    },
    {
        num: '03',
        img: '/assets/img/engines/ai-lab.png',
        title: 'AI Lab',
        tagline: 'Research, experiment, evaluate, and improve AI.',
        description: 'Build and evaluate AI models with experiment tracking, training workflows, benchmarks, and expert-driven research.',
        features: ['AI Research', 'Model Training', 'Fine-tuning', 'Model Evaluation', 'Experiment Tracking', 'Model Registry'],
    },
]

const EnginesArea = () => {
    const { t } = useT();
    return (
        <section className="tp-engines-area p-relative pt-120 pb-90">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="tp-engines-title-wrapper">
                            <h3 className="tp-section-title">{t('One Platform.')}
                                <span className="title-color">{t('Three Engines.')}</span>
                            </h3>
                            <p>{t('Everything you need to build, improve, and scale AI in one platform.')}</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {engines_data.map((item, i) =>
                        <div key={i} className="col-lg-12">
                            <div className="tp-engines-wrapper mb-60">
                                <div className="tp-engines-content">
                                    <h4 className="tp-engines-title"><span>{item.num}</span> — {t(item.title)}</h4>
                                    <p className="tp-engines-tagline">{t(item.tagline)}</p>
                                    <p className="tp-engines-text">{t(item.description)}</p>
                                    <ul className="tp-engines-list">
                                        {item.features.map((feature, index) =>
                                            <li key={index}><span><RightSymbol /></span>{t(feature)}</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="tp-engines-thumb">
                                    <Image src={item.img} alt={t(item.title)} width={675} height={590} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default EnginesArea;
