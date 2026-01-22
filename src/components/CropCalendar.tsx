import { motion } from 'framer-motion';
import { Calendar, Grape, Leaf, CheckCircle2 } from 'lucide-react';

interface CropTask {
  month: string;
  tasks: string[];
  completed: boolean;
}

const grapeTasks: CropTask[] = [
  { month: 'जानेवारी', tasks: ['छाटणी', 'खत व्यवस्थापन'], completed: true },
  { month: 'फेब्रुवारी', tasks: ['फवारणी', 'पाणी व्यवस्थापन'], completed: true },
  { month: 'मार्च', tasks: ['फळ विकास', 'रोग नियंत्रण'], completed: false },
  { month: 'एप्रिल', tasks: ['काढणी तयारी'], completed: false },
];

const chickpeaTasks: CropTask[] = [
  { month: 'ऑक्टोबर', tasks: ['पेरणी', 'बीजप्रक्रिया'], completed: true },
  { month: 'नोव्हेंबर', tasks: ['खुरपणी', 'तण व्यवस्थापन'], completed: true },
  { month: 'डिसेंबर', tasks: ['फवारणी'], completed: false },
  { month: 'जानेवारी', tasks: ['काढणी'], completed: false },
];

export const CropCalendar = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">पीक दिनदर्शिका</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grape Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Grape className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">द्राक्ष 🍇</h3>
              <p className="text-xs text-muted-foreground">ऑक्टोबर - एप्रिल</p>
            </div>
          </div>

          <div className="space-y-2">
            {grapeTasks.map((task, index) => (
              <div
                key={task.month}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  task.completed ? 'bg-secondary/10' : 'bg-muted/50'
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.month}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.tasks.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chickpea Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-harvest-gold/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">हरभरा 🌱</h3>
              <p className="text-xs text-muted-foreground">ऑक्टोबर - जानेवारी</p>
            </div>
          </div>

          <div className="space-y-2">
            {chickpeaTasks.map((task, index) => (
              <div
                key={task.month}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  task.completed ? 'bg-harvest-gold/10' : 'bg-muted/50'
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.month}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.tasks.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
