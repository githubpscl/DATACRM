import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { prisma } from '../index';
import { AuthRequest, requireCompanyAccess } from '../middleware/auth';

const router = Router();

// Initialize OpenAI (optional)
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
} catch (error) {
  console.log('OpenAI not configured - using fallback AI logic')
}

// AI-powered customer segmentation
router.post('/segment-customers', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const { criteria, name } = req.body;

    // Get all customers for the company
    const customers = await prisma.customer.findMany({
      where: { companyId: req.user!.companyId },
      include: {
        activities: true,
        campaignDeliveries: {
          include: { campaign: true }
        }
      }
    });

    // Use AI to analyze customers and create segments
    const prompt = `
    Analyze the following customer data and create intelligent segments based on the criteria: "${criteria}".
    
    Customer data summary:
    - Total customers: ${customers.length}
    - Customer sample: ${JSON.stringify(customers.slice(0, 5), null, 2)}
    
    Please respond with a JSON object containing:
    1. segments: Array of segment objects with { name, description, conditions, estimatedSize }
    2. reasoning: Explanation of the segmentation logic
    
    Focus on actionable business segments that can be used for targeted marketing.
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI marketing analyst specializing in customer segmentation. Provide practical, actionable customer segments based on behavioral and demographic data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'Failed to generate AI segmentation' });
    }

    try {
      const segmentData = JSON.parse(aiResponse);
      
      // Create the main segment in database
      const segment = await prisma.segment.create({
        data: {
          name: name || 'AI Generated Segment',
          description: `AI-generated segment based on: ${criteria}`,
          conditions: segmentData,
          companyId: req.user!.companyId,
          createdBy: req.user!.id,
          aiGenerated: true
        }
      });

      res.json({
        segment,
        aiAnalysis: segmentData,
        customerCount: customers.length
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('AI segmentation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI content generation for campaigns
router.post('/generate-content', 
  requireCompanyAccess,
  [
    body('type').isIn(['email', 'sms', 'whatsapp']),
    body('audience').notEmpty(),
    body('goal').notEmpty(),
    body('tone').optional().isIn(['professional', 'casual', 'friendly', 'urgent'])
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, audience, goal, tone = 'professional', customPrompt, productInfo } = req.body;

      const prompt = `
      Create ${type} marketing content with the following specifications:
      
      Target Audience: ${audience}
      Campaign Goal: ${goal}
      Tone: ${tone}
      ${productInfo ? `Product/Service Info: ${productInfo}` : ''}
      ${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}
      
      Please provide:
      1. Subject line (for email) or opening line (for SMS/WhatsApp)
      2. Main content body
      3. Call-to-action
      4. Personalization suggestions
      5. A/B test variations (3 different versions)
      
      Format as JSON with the structure:
      {
        "subject": "...",
        "content": "...",
        "callToAction": "...",
        "personalization": ["...", "..."],
        "variations": [
          {"subject": "...", "content": "...", "callToAction": "..."},
          {"subject": "...", "content": "...", "callToAction": "..."},
          {"subject": "...", "content": "...", "callToAction": "..."}
        ]
      }
      `;

      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert marketing copywriter specializing in ${type} campaigns. Create compelling, conversion-focused content that resonates with the target audience.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        return res.status(500).json({ error: 'Failed to generate content' });
      }

      try {
        const contentData = JSON.parse(aiResponse);
        
        res.json({
          content: contentData,
          metadata: {
            type,
            audience,
            goal,
            tone,
            generatedAt: new Date().toISOString()
          }
        });
      } catch (parseError) {
        console.error('Error parsing content response:', parseError);
        res.status(500).json({ 
          error: 'Failed to parse AI response',
          rawResponse: aiResponse
        });
      }
    } catch (error) {
      console.error('AI content generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// AI campaign optimization suggestions
router.post('/optimize-campaign', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    const { campaignId } = req.body;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        companyId: req.user!.companyId
      },
      include: {
        deliveries: true,
        segment: {
          include: {
            customers: {
              include: {
                customer: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Calculate campaign metrics
    const totalSent = campaign.deliveries.length;
    const opened = campaign.deliveries.filter(d => d.openedAt).length;
    const clicked = campaign.deliveries.filter(d => d.clickedAt).length;
    const bounced = campaign.deliveries.filter(d => d.bouncedAt).length;

    const metrics = {
      totalSent,
      opened,
      clicked,
      bounced,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
      bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0
    };

    const prompt = `
    Analyze this email campaign performance and provide optimization recommendations:
    
    Campaign: ${campaign.name}
    Type: ${campaign.type}
    Subject: ${campaign.subject}
    Content: ${campaign.content?.substring(0, 500)}...
    
    Performance Metrics:
    - Total Sent: ${metrics.totalSent}
    - Open Rate: ${metrics.openRate.toFixed(2)}%
    - Click Rate: ${metrics.clickRate.toFixed(2)}%
    - Bounce Rate: ${metrics.bounceRate.toFixed(2)}%
    
    Audience Size: ${campaign.segment?.customers.length || 0}
    
    Please provide actionable optimization recommendations in JSON format:
    {
      "overallScore": "A/B/C/D/F",
      "recommendations": [
        {
          "category": "subject_line|content|timing|audience|design",
          "priority": "high|medium|low",
          "recommendation": "specific actionable advice",
          "expectedImprovement": "percentage or description"
        }
      ],
      "nextSteps": ["immediate action items"],
      "benchmarks": {
        "industryOpenRate": "X%",
        "industryClickRate": "X%"
      }
    }
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI marketing optimization expert. Analyze campaign performance and provide specific, actionable recommendations to improve engagement and conversions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'Failed to generate optimization recommendations' });
    }

    try {
      const optimization = JSON.parse(aiResponse);
      
      res.json({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type
        },
        metrics,
        optimization,
        generatedAt: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('Error parsing optimization response:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('AI campaign optimization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI-powered insights and recommendations
router.get('/insights', requireCompanyAccess, async (req: AuthRequest, res) => {
  try {
    // Gather data for insights
    const [
      customerCount,
      campaignCount,
      recentCampaigns,
      topSegments,
      recentActivities
    ] = await Promise.all([
      prisma.customer.count({ where: { companyId: req.user!.companyId } }),
      prisma.campaign.count({ where: { companyId: req.user!.companyId } }),
      prisma.campaign.findMany({
        where: { companyId: req.user!.companyId },
        include: { deliveries: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.segment.findMany({
        where: { companyId: req.user!.companyId },
        include: { customers: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.customerActivity.findMany({
        where: { 
          customer: { companyId: req.user!.companyId }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    ]);

    const prompt = `
    Analyze this CRM data and provide strategic business insights and recommendations:
    
    Business Overview:
    - Total Customers: ${customerCount}
    - Total Campaigns: ${campaignCount}
    - Active Segments: ${topSegments.length}
    
    Recent Campaign Performance:
    ${recentCampaigns.map(c => `
    - ${c.name}: ${c.deliveries.length} sent, ${c.deliveries.filter(d => d.openedAt).length} opened
    `).join('')}
    
    Top Segments:
    ${topSegments.map(s => `
    - ${s.name}: ${s.customers.length} customers
    `).join('')}
    
    Provide insights in JSON format:
    {
      "summary": "overall business health assessment",
      "keyInsights": [
        {
          "title": "insight title",
          "description": "detailed insight",
          "impact": "high|medium|low",
          "category": "growth|engagement|retention|optimization"
        }
      ],
      "recommendations": [
        {
          "title": "recommendation title",
          "description": "actionable recommendation",
          "priority": "high|medium|low",
          "effort": "low|medium|high",
          "expectedOutcome": "expected result"
        }
      ],
      "trends": [
        "identified trend 1",
        "identified trend 2"
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI business intelligence analyst specializing in CRM and marketing analytics. Provide strategic insights and actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'Failed to generate insights' });
    }

    try {
      const insights = JSON.parse(aiResponse);
      
      res.json({
        insights,
        dataSnapshot: {
          customerCount,
          campaignCount,
          segmentCount: topSegments.length,
          lastAnalyzed: new Date().toISOString()
        }
      });
    } catch (parseError) {
      console.error('Error parsing insights response:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
