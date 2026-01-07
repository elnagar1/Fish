const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding default questions...');

const defaultQuestions = [
    {
        number: 1,
        text: 'ما هو نوع المزرعة السمكية الخاصة بك؟',
        type: 'radio',
        options: [
            { value: 'أحواض ترابية', label: 'أحواض ترابية', icon: '🌍' },
            { value: 'أحواض خرسانية', label: 'أحواض خرسانية', icon: '🧱' },
            { value: 'أقفاص عائمة', label: 'أقفاص عائمة', icon: '⚓' },
            { value: 'نظام تدوير المياه (RAS)', label: 'نظام RAS', icon: '🔄' },
            { value: 'أحواض بلاستيكية/فيبرجلاس', label: 'أحواض بلاستيك', icon: '🛁' },
            { value: 'أخرى', label: 'أخرى', icon: '❓' }
        ]
    },
    {
        number: 2,
        text: 'ما هو نوع الأسماك المستزرعة؟',
        type: 'radio',
        options: [
            { value: 'بلطي (Tilapia)', label: 'بلطي', icon: '🐟' },
            { value: 'بوري (Mullet)', label: 'بوري', icon: '🐠' },
            { value: 'قاروص (Sea Bass)', label: 'قاروص', icon: '🦈' },
            { value: 'دنيس (Sea Bream)', label: 'دنيس', icon: '🐡' },
            { value: 'جمبري (Shrimp)', label: 'جمبري', icon: '🦐' },
            { value: 'مبروك (Carp)', label: 'مبروك', icon: '🎏' }
        ]
    },
    {
        number: 3,
        text: 'ما هو حجم مزرعتك؟',
        type: 'radio',
        options: [
            { value: 'صغيرة (أقل من 1 فدان)', label: 'صغيرة (أقل من 1 فدان)', icon: '🌱' },
            { value: 'متوسطة (1 - 5 فدان)', label: 'متوسطة (1 - 5 فدان)', icon: '🌿' },
            { value: 'كبيرة (أكثر من 5 فدان)', label: 'كبيرة (أكثر من 5 فدان)', icon: '🏭' }
        ]
    },
    {
        number: 4,
        text: 'ما هو التحدي أو السؤال الرئيسي لديك؟',
        type: 'radio',
        options: [
            { value: 'مشاكل في جودة المياه', label: 'مشاكل في جودة المياه', icon: '💧' },
            { value: 'أمراض تصيب الأسماك', label: 'أمراض تصيب الأسماك', icon: '🏥' },
            { value: 'انخفاض معدل النمو', label: 'انخفاض معدل النمو', icon: '📉' },
            { value: 'مشاكل في التغذية', label: 'مشاكل في التغذية', icon: '🍽️' },
            { value: 'نفوق مفاجئ للأسماك', label: 'نفوق مفاجئ للأسماك', icon: '⚠️' },
            { value: 'تحسين الإنتاجية والربحية', label: 'تحسين الإنتاجية والربحية', icon: '💰' },
            { value: 'بدء مشروع جديد', label: 'بدء مشروع جديد', icon: '🚀' }
        ]
    },
    {
        number: 5,
        text: 'هل لديك تفاصيل إضافية تود مشاركتها؟',
        type: 'textarea',
        options: []
    }
];

db.serialize(() => {
    let completed = 0;
    const total = defaultQuestions.length;

    defaultQuestions.forEach((q, index) => {
        db.run(
            'INSERT INTO questions (question_number, question_text, question_type) VALUES (?, ?, ?)',
            [q.number, q.text, q.type],
            function (err) {
                if (err) {
                    console.error(`❌ Error inserting question ${q.number}:`, err.message);
                    completed++;
                    if (completed === total) finish();
                    return;
                }

                const questionId = this.lastID;
                console.log(`✅ Question ${q.number} inserted (ID: ${questionId})`);

                if (q.options && q.options.length > 0) {
                    let optionsInserted = 0;
                    q.options.forEach(opt => {
                        db.run(
                            'INSERT INTO question_options (question_id, option_value, option_label, option_icon) VALUES (?, ?, ?, ?)',
                            [questionId, opt.value, opt.label, opt.icon],
                            (err) => {
                                if (err) {
                                    console.error(`   ❌ Error inserting option:`, err.message);
                                }
                                optionsInserted++;
                                if (optionsInserted === q.options.length) {
                                    console.log(`   ✅ ${q.options.length} options inserted`);
                                    completed++;
                                    if (completed === total) finish();
                                }
                            }
                        );
                    });
                } else {
                    completed++;
                    if (completed === total) finish();
                }
            }
        );
    });
});

function finish() {
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('\n✅ All questions added successfully!');
            }
        });
    }, 500);
}
