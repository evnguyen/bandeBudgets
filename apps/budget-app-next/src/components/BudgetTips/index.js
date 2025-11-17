import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SavingsIcon from "@mui/icons-material/Savings";

export const BudgetTips = () => {
  const tips = [
    {
      title: "Zero-Based Budgeting",
      icon: <TrendingUpIcon />,
      content: "Every dollar should have a job. Your income minus expenses should equal zero. This ensures you're intentional with every penny.",
      category: "Philosophy"
    },
    {
      title: "50/30/20 Rule",
      icon: <LightbulbIcon />,
      content: "Spend 50% on needs, 30% on wants, and save 20% of your income. A simple starting point for budgeting beginners.",
      category: "Strategy"
    },
    {
      title: "Emergency Fund",
      icon: <SavingsIcon />,
      content: "Aim for 3-6 months of expenses in savings. Start small - even $1,000 can protect against unexpected costs.",
      category: "Savings"
    },
    {
      title: "Envelope System",
      icon: <LightbulbIcon />,
      content: "Use cash envelopes for spending categories. When the envelope is empty, you stop spending in that category.",
      category: "Method"
    },
    {
      title: "Track Every Expense",
      icon: <TrendingUpIcon />,
      content: "Record every purchase for 30 days. Awareness is the first step to changing spending habits.",
      category: "Habit"
    },
    {
      title: "Review Monthly",
      icon: <LightbulbIcon />,
      content: "Review your budget weekly and adjust monthly. Life changes, and so should your budget.",
      category: "Maintenance"
    }
  ];

  const categories = [...new Set(tips.map(tip => tip.category))];

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LightbulbIcon color="primary" />
        Budgeting Tips
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Master the art of budgeting with these proven strategies
      </Typography>

      <Stack spacing={1} sx={{ mb: 2 }}>
        {categories.map(category => (
          <Chip
            key={category}
            label={category}
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
        ))}
      </Stack>

      <Stack spacing={1}>
        {tips.map((tip, index) => (
          <Accordion key={index} elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 48,
                '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 }
              }}
            >
              <Box sx={{ color: 'primary.main' }}>
                {tip.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2">{tip.title}</Typography>
                <Chip
                  label={tip.category}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 18 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {tip.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Pro Tip
        </Typography>
        <Typography variant="body2">
          Start with one category. Focus on reducing spending in just one area this month.
          Small wins build momentum!
        </Typography>
      </Box>
    </Paper>
  );
};
