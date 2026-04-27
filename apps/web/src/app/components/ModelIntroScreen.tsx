import { ArrowLeft, CheckCircle2, ListOrdered, Lightbulb } from 'lucide-react';

interface ModelIntroScreenProps {
  onNavigate: (screen: string) => void;
  previousScreen?: string;
  modelId: string;
}

const modelIntros: Record<string, any> = {
  prep: {
    title: 'PREP法ってなに？',
    icon: CheckCircle2,
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    intro: '話がうまくまとまる、4ステップの型です。\n話す順番はこれだけです。',
    formula: 'P → R → E → P',
    formulaDetail: '結論 → 理由 → 例 → まとめ',
    summary: '先に答えを言って、理由を言って、例を出して、最後にもう一回まとめる\nこれだけで、ぐっと伝わりやすくなります。',
    steps: [
      {
        num: '1',
        letter: 'P',
        title: 'Point（結論）',
        description: 'まずは何を言いたいかを先に言いましょう。\n最初に結論を言うと、相手が話を追いやすくなります。',
        expressions: [
          '私は〜だと思います。',
          '結論から言うと、〜です。',
          '〜が大切だと思います。'
        ],
        tip: 'だらだら前置きしないで、先に答えをポン！と出す感じです。'
      },
      {
        num: '2',
        letter: 'R',
        title: 'Reason（理由）',
        description: '次に、なぜそう思うのかを伝えます。\n結論だけだと「ふーん」で終わるので、理由を足して説得力を出します。',
        expressions: [
          '理由は、〜からです。',
          'なぜなら、〜だからです。',
          'その理由は、〜です。'
        ],
        tip: 'まずは理由1つでOKです。たくさん言わなくても大丈夫です。'
      },
      {
        num: '3',
        letter: 'E',
        title: 'Example（例）',
        description: '次は、小さい例を入れましょう。\n例があると、相手が「なるほど」とイメージしやすくなります。',
        expressions: [
          '例えば、〜です。',
          'たとえば、〜のときです。',
          '実際に、〜ことがあります。'
        ],
        tip: '長い例はいりません。1文だけでも十分です。'
      },
      {
        num: '4',
        letter: 'P',
        title: 'Point（まとめ）',
        description: '最後に、もう一度言いたいことをまとめます。\nこれで話がきれいに終わります。',
        expressions: [],
        tip: '最初の結論を、最後にやさしくもう一回言えばOKです。'
      }
    ],
    finalImage: '「私はこう思います。なぜなら〜。例えば〜。だからこうです。」'
  },
  stepbystep: {
    title: 'ステップ解説法ってなに？',
    icon: ListOrdered,
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    intro: '順番に説明していく、わかりやすい型です。\n手順や流れを伝えるときに使います。',
    formula: '第一段階 → 第二段階 → 第三段階 → 完成',
    formulaDetail: '時系列で順序立てて説明する',
    summary: '「まず〜、次に〜、そして〜、最後に〜」\nこの順番で話せば、相手が混乱しません。',
    steps: [
      {
        num: '1',
        letter: '第一',
        title: '第一段階（最初）',
        description: 'まず最初に何をするか、何から始まるかを言います。\nスタート地点をはっきり示すことが大事です。',
        expressions: [
          'まず、〜します。',
          '最初に、〜です。',
          '第一に、〜から始めます。'
        ],
        tip: '「まず」を使うと、聞き手が「これが最初だ」とわかります。'
      },
      {
        num: '2',
        letter: '第二',
        title: '第二段階（次）',
        description: '次に何をするか、次はどうなるかを説明します。\n第一段階の後に続くことを話します。',
        expressions: [
          '次に、〜します。',
          'その後、〜です。',
          '続いて、〜します。'
        ],
        tip: '「次に」で自然につながります。'
      },
      {
        num: '3',
        letter: '第三',
        title: '第三段階（そして）',
        description: 'さらに次の段階を説明します。\n必要なら、ここに追加の情報を入れてもOKです。',
        expressions: [
          'そして、〜します。',
          'さらに、〜です。',
          'また、〜もあります。'
        ],
        tip: '段階が2つだけなら、この部分は省略してもOKです。'
      },
      {
        num: '4',
        letter: '完成',
        title: '完成（最後）',
        description: '最後にどうなるか、何が完成するかを伝えます。\nゴールを示すことで、話がすっきり終わります。',
        expressions: [
          '最後に、〜です。',
          'こうして、〜が完成します。',
          'これで、〜ができます。'
        ],
        tip: '「最後に」「こうして」で締めると、話が終わったと伝わります。'
      }
    ],
    finalImage: '「まず〜します。次に〜します。そして〜します。最後に〜ができます。」'
  },
  scqa: {
    title: 'SCQA法ってなに？',
    icon: Lightbulb,
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    intro: '問題を見せてから答えを出す、ストーリー型の説明法です。\nビジネスや提案で使われます。',
    formula: 'S → C → Q → A',
    formulaDetail: '状況 → 課題 → 疑問 → 答え',
    summary: '「こういう状況で、こんな問題があって、だからこの答えです」\n問題意識を共有してから解決策を示すので、納得感が強いです。',
    steps: [
      {
        num: '1',
        letter: 'S',
        title: 'Situation（状況）',
        description: 'まず、今どんな状況なのかを説明します。\n背景や現状を共有して、話の土台を作ります。',
        expressions: [
          '現在、〜という状況です。',
          '最近、〜が起きています。',
          '今、〜という状態です。'
        ],
        tip: 'みんなが知っている状況から始めると、話に入りやすいです。'
      },
      {
        num: '2',
        letter: 'C',
        title: 'Complication（課題）',
        description: '次に、その状況の中で何が問題なのかを示します。\n「困っていること」を明確にします。',
        expressions: [
          'しかし、〜という問題があります。',
          'ところが、〜で困っています。',
          'その結果、〜という課題が生まれました。'
        ],
        tip: '「しかし」「ところが」を使うと、問題が際立ちます。'
      },
      {
        num: '3',
        letter: 'Q',
        title: 'Question（疑問）',
        description: 'では、どうすればいいのか？という疑問を投げかけます。\n聞き手と一緒に「答えは何だろう」と考える場を作ります。',
        expressions: [
          'では、どうすればいいでしょうか。',
          'この問題をどう解決すればいいでしょうか。',
          'そこで、〜という疑問が生まれます。'
        ],
        tip: 'この部分は短くてOK。すぐに答えに進みましょう。'
      },
      {
        num: '4',
        letter: 'A',
        title: 'Answer（答え）',
        description: '最後に、答えや解決策を示します。\nここまでの流れがあるので、答えが自然に納得されます。',
        expressions: [
          '答えは、〜です。',
          '解決策として、〜を提案します。',
          'そのために、〜が必要です。'
        ],
        tip: '問題をしっかり示したあとなので、答えがすっと入ります。'
      }
    ],
    finalImage: '「今こういう状況で、こんな問題があって、どうすればいい？答えは〜です。」'
  }
};

export default function ModelIntroScreen({ onNavigate, previousScreen, modelId }: ModelIntroScreenProps) {
  const intro = modelIntros[modelId] || modelIntros.prep;
  const Icon = intro.icon;

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button
          onClick={() => onNavigate(previousScreen || 'modelList')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">戻る</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className={`${intro.bgColor} p-3 rounded-2xl`}>
            <Icon className={`w-7 h-7 ${intro.iconColor}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{intro.title}</h1>
        </div>
      </div>

      {/* Introduction */}
      <div className="px-6 pt-6 pb-4">
        <div className={`${intro.bgColor} border-2 ${intro.borderColor} rounded-3xl p-6`}>
          <p className="text-gray-900 leading-relaxed mb-4 whitespace-pre-line">
            {intro.intro}
          </p>
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="text-center text-2xl font-bold text-gray-900 mb-2">
              {intro.formula}
            </p>
            <p className="text-center text-gray-700 font-medium">
              {intro.formulaDetail}
            </p>
          </div>
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            {intro.summary}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 space-y-4">
        {intro.steps.map((step: any) => (
          <div key={step.num} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            {/* Step Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`bg-gradient-to-r ${intro.color} text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold`}>
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {step.description}
            </p>

            {/* Expressions */}
            {step.expressions.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 mb-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2">よく使う表現</h4>
                <ul className="space-y-1.5">
                  {step.expressions.map((expr: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{expr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tip */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-sm text-gray-900">
                <span className="font-bold">💡 コツ：</span> {step.tip}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Final Image */}
      <div className="px-6 pt-4 pb-6">
        <div className={`bg-gradient-to-r ${intro.color} rounded-3xl p-6 text-white text-center shadow-xl`}>
          <h3 className="font-bold text-lg mb-3">イメージ</h3>
          <p className="text-xl leading-relaxed">
            {intro.finalImage}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 sticky bottom-0 bg-white pt-4 pb-6 border-t border-gray-100">
        <button
          onClick={() => onNavigate(previousScreen === 'modelList' ? 'modelList' : (previousScreen || 'modelList'))}
          className={`w-full bg-gradient-to-r ${intro.color} text-white font-bold py-5 rounded-2xl shadow-lg`}
        >
          {previousScreen === 'modelList' ? '説明モデル一覧に戻る' : '戻る'}
        </button>
      </div>
    </div>
  );
}
