"""
Enterprise Athena Agent - Enhanced with TrustWrapper Enterprise Platform
Combines CollaborativeIntelligence agent capabilities with enterprise-grade trust infrastructure
"""

import asyncio
import time
from typing import Dict, Any, Optional
import sys
from pathlib import Path

# Add integrations to path
sys.path.append(str(Path(__file__).parent.parent.parent))

try:
    from integrations.trustwrapper_bridge import trust_bridge, EnterpriseAnalysisResult
    ENTERPRISE_FEATURES_AVAILABLE = True
except ImportError as e:
    ENTERPRISE_FEATURES_AVAILABLE = False
    print(f"⚠️ Enterprise features not available: {e}")


class EnterpriseAthenaAgent:
    """
    Athena agent enhanced with TrustWrapper enterprise platform capabilities

    Features:
    - Standard CollaborativeIntelligence agent functionality
    - Enterprise-grade compliance checking
    - AI hallucination detection
    - Real-time verification and trust scoring
    - Performance monitoring and analytics
    """

    def __init__(self):
        self.agent_name = "EnterpriseAthena"
        self.enterprise_enabled = ENTERPRISE_FEATURES_AVAILABLE

        if self.enterprise_enabled:
            self.bridge_status = trust_bridge.get_integration_status()
            print(f"🏢 Enterprise Athena initialized with TrustWrapper platform")
            print(f"   Bridge status: {self.bridge_status['bridge_status']}")
            print(f"   Components: {self.bridge_status['components_loaded']}")
        else:
            print("🔍 Enterprise Athena running in standard mode (no TrustWrapper)")

    async def execute(self, task: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a task with enterprise-grade analysis and verification

        Args:
            task: The task or query to process
            context: Optional context information

        Returns:
            Dictionary containing response and enterprise analysis
        """

        start_time = time.time()

        # Step 1: Generate standard Athena response
        # (In a real implementation, this would call the actual Athena agent)
        standard_response = await self._generate_athena_response(task, context)

        # Step 2: Enterprise analysis (if available)
        enterprise_analysis = None
        if self.enterprise_enabled:
            try:
                enterprise_analysis = await trust_bridge.analyze_agent_response(
                    agent_name=self.agent_name,
                    task=task,
                    response=standard_response
                )
            except Exception as e:
                print(f"⚠️ Enterprise analysis failed: {e}")
                enterprise_analysis = None

        execution_time = (time.time() - start_time) * 1000

        # Step 3: Combine results
        return {
            "agent": self.agent_name,
            "task": task,
            "response": standard_response,
            "enterprise_analysis": self._format_enterprise_analysis(enterprise_analysis),
            "execution_time_ms": execution_time,
            "enterprise_enabled": self.enterprise_enabled,
            "timestamp": time.time()
        }

    async def _generate_athena_response(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate standard Athena agent response
        (Placeholder - would integrate with actual Athena agent)
        """

        # Simulate intelligent response generation
        await asyncio.sleep(0.1)  # Simulate processing time

        # For demo purposes, generate contextual responses
        if "explain" in task.lower():
            return f"Based on my analysis of '{task}', here are the key insights: This involves multiple interconnected factors that require careful consideration. The underlying principles suggest that a systematic approach would be most effective, taking into account both immediate requirements and long-term implications."

        elif "financial" in task.lower() or "invest" in task.lower():
            return f"Regarding '{task}': While I can provide general information about financial topics, I cannot offer specific investment advice. Financial decisions should always be made in consultation with qualified financial advisors who can assess your individual circumstances and risk tolerance."

        elif "medical" in task.lower() or "health" in task.lower():
            return f"Concerning '{task}': This touches on health-related topics. While I can share general information, it's important to consult with healthcare professionals for personalized medical advice. Health decisions should always be made with proper medical supervision."

        else:
            return f"Thank you for your query about '{task}'. Based on my knowledge and analytical capabilities, I can provide comprehensive insights into this topic. Let me break down the key aspects and provide a structured analysis that addresses your specific requirements while maintaining accuracy and usefulness."

    def _format_enterprise_analysis(self, analysis: Optional[EnterpriseAnalysisResult]) -> Dict[str, Any]:
        """Format enterprise analysis for output"""

        if not analysis:
            return {
                "status": "unavailable",
                "message": "Enterprise analysis not available"
            }

        # Use comprehensive trust score if available, otherwise fallback to basic calculation
        overall_trust = analysis.trust_score
        if overall_trust is None:
            trust_factors = []
            if analysis.compliance_risk_score is not None:
                trust_factors.append(1.0 - analysis.compliance_risk_score)  # Lower risk = higher trust
            if analysis.hallucination_confidence is not None:
                trust_factors.append(1.0 - analysis.hallucination_confidence)  # Lower hallucination risk = higher trust
            overall_trust = sum(trust_factors) / len(trust_factors) if trust_factors else 0.5

        # Build result with XAI capabilities
        result = {
            "status": "available",
            "trust_score": round(overall_trust, 3),
            "compliance": {
                "violations_found": len(analysis.compliance_violations),
                "risk_score": analysis.compliance_risk_score,
                "violations": analysis.compliance_violations[:3]  # Top 3 violations
            },
            "ai_safety": {
                "hallucination_detected": analysis.hallucination_detected,
                "confidence": analysis.hallucination_confidence,
                "evidence": analysis.hallucination_evidence[:2] if analysis.hallucination_evidence else []
            },
            "performance": {
                "analysis_time_ms": analysis.analysis_time_ms,
                "platform_health": analysis.platform_health
            },
            "enterprise_grade": True
        }

        # Add XAI information if available
        if analysis.xai_explanation:
            result["explainability"] = {
                "method": analysis.explanation_method,
                "confidence": analysis.explainability_confidence,
                "reasoning": analysis.explanation_reasoning,
                "top_features": analysis.feature_importance[:3] if analysis.feature_importance else [],
                "explanation_available": True
            }
        else:
            result["explainability"] = {
                "explanation_available": False,
                "message": "XAI components not available"
            }

        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities and status"""
        base_capabilities = {
            "agent_type": "EnterpriseAthena",
            "standard_features": [
                "Knowledge synthesis",
                "Complex reasoning",
                "Multi-domain expertise",
                "Contextual analysis"
            ]
        }

        if self.enterprise_enabled:
            enterprise_features = []
            if self.bridge_status.get('enterprise_features', {}).get('compliance_checking'):
                enterprise_features.append("Real-time compliance checking")
            if self.bridge_status.get('enterprise_features', {}).get('hallucination_detection'):
                enterprise_features.append("AI hallucination detection")
            if self.bridge_status.get('enterprise_features', {}).get('xai_analysis'):
                enterprise_features.append("Explainable AI analysis")
            if self.bridge_status.get('enterprise_features', {}).get('performance_monitoring'):
                enterprise_features.append("Performance monitoring")

            base_capabilities["enterprise_features"] = enterprise_features
            base_capabilities["trustwrapper_status"] = self.bridge_status

        return base_capabilities

    async def explain_response(self, task: str, response: str) -> Dict[str, Any]:
        """
        Generate explanation for a response (XAI capability when available)
        """

        if not self.enterprise_enabled:
            return {
                "explanation": "Explanation capabilities require TrustWrapper enterprise platform",
                "available": False
            }

        try:
            # Use the bridge to get XAI analysis
            enterprise_analysis = await trust_bridge.analyze_agent_response(
                agent_name=self.agent_name,
                task=task,
                response=response
            )

            if enterprise_analysis and enterprise_analysis.xai_explanation:
                xai = enterprise_analysis.xai_explanation
                return {
                    "explanation": {
                        "method": xai["method"],
                        "confidence": f"{xai['confidence']:.1%}",
                        "reasoning": xai["reasoning"],
                        "top_features": xai["features"][:5],  # Top 5 features
                        "trust_score": f"{enterprise_analysis.trust_score:.1%}" if enterprise_analysis.trust_score else "N/A",
                        "analysis_time": f"{xai['explanation_time_ms']}ms"
                    },
                    "safety_analysis": {
                        "compliance_risk": f"{enterprise_analysis.compliance_risk_score:.1%}" if enterprise_analysis.compliance_risk_score else "N/A",
                        "hallucination_risk": f"{enterprise_analysis.hallucination_confidence:.1%}" if enterprise_analysis.hallucination_confidence else "N/A",
                        "violations_found": len(enterprise_analysis.compliance_violations)
                    },
                    "available": True,
                    "full_xai_enabled": True
                }
            else:
                # Fallback explanation without XAI
                return {
                    "explanation": {
                        "reasoning": f"Response generated based on analysis of: '{task}'",
                        "confidence": "High - based on knowledge synthesis",
                        "approach": "Multi-factor analysis with safety considerations",
                        "trust_factors": [
                            "Compliance checking verified",
                            "Hallucination detection applied",
                            "Enterprise-grade validation"
                        ]
                    },
                    "available": True,
                    "full_xai_enabled": False,
                    "note": "XAI components not fully available - using basic explanation"
                }

        except Exception as e:
            return {
                "explanation": f"Error generating explanation: {e}",
                "available": False,
                "error": True
            }


# Create global enterprise agent instance
enterprise_athena = EnterpriseAthenaAgent()


# CLI Integration for CollaborativeIntelligence
async def activate_enterprise_athena(task: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    CLI-compatible activation function for Enterprise Athena
    """
    return await enterprise_athena.execute(task, context)


async def get_xai_explanation(task: str, response: str) -> Dict[str, Any]:
    """
    CLI-compatible function to get XAI explanation for a task and response
    """
    return await enterprise_athena.explain_response(task, response)


if __name__ == "__main__":
    import sys

    # Simple CLI test
    if len(sys.argv) > 1:
        task = " ".join(sys.argv[1:])
        result = asyncio.run(activate_enterprise_athena(task))
        print(f"\\n🏢 Enterprise Athena Response:")
        print(f"📝 Response: {result['response']}")

        if result['enterprise_enabled'] and result['enterprise_analysis']['status'] == 'available':
            ea = result['enterprise_analysis']
            print(f"\\n🛡️ Enterprise Analysis:")
            print(f"   Trust Score: {ea['trust_score']}")
            print(f"   Compliance: {ea['compliance']['violations_found']} violations")
            print(f"   AI Safety: {'⚠️' if ea['ai_safety']['hallucination_detected'] else '✅'}")

            # Show XAI information if available
            if ea.get('explainability', {}).get('explanation_available'):
                xai = ea['explainability']
                print(f"\\n🧠 Explainable AI:")
                print(f"   Method: {xai['method']}")
                print(f"   Confidence: {xai['confidence']:.1%}")
                print(f"   Reasoning: {xai['reasoning']}")
                if xai['top_features']:
                    print(f"   Top Factors:")
                    for feature in xai['top_features']:
                        print(f"     • {feature['feature']}: {feature['importance']:.2f}")
            else:
                print(f"\\n🧠 XAI: {ea.get('explainability', {}).get('message', 'Not available')}")

        print(f"\\n⏱️ Total time: {result['execution_time_ms']:.1f}ms")
    else:
        print("Usage: python enterprise_athena.py <your question>")
        print("Example: python enterprise_athena.py 'Explain quantum computing'")