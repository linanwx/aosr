import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const enTranslation = {
    // Initial Interface
    StartTextLearn: "Reinforce Learning",
    StartTextNew: "New Content",
    StartTextReview: "Review",
    StartTextEmpty: "Great job, you've completed all your reviews! Now, it's time to let this knowledge sink in. Your next review cycle will be available soon. Until then, feel free to add more cards to keep your learning going.",
    // Card Interface Stage One - Degree of Memorization
    ButtonTextForget: "Forgot", // Forgot
    ButtonNotSure: "Not Sure", // Not sure
    ButtonTextKnown: "I Know", // I know
    // Card Interface Stage Two - Correct or Wrong
    ButtonTextForget2: "Got It", // Forgot, but now I got it
    ButtonTextHard: "Difficult", // A bit difficult
    ButtonTextFair: "Okay", // Okay
    ButtonTextEasy: "Easy", // Easy
    ButtonTextWrong: "Misremembered", // Misremembered
    // Button Area
    ButtonTextSkip: "Skip", // Skip to the next
    ButtonTextOpenFile: "Open File", // Open the file location
    ButtonTextOpenLast: "Open Last", // Open the file location of the previous one
    ClipTextEase: "Ease of Recall", // Ease of recall, higher value indicates easier
    // Configuration File
    SettingTextAosrSettings: "Settings for Aosr",
    SettingTextInitEase: "Initial Ease",
    SettingTextInitEaseDesc: "The baseline for review frequency. The review interval is calculated as (this value/100) * time since the last review. A smaller number results in a higher review frequency. Recommended: 250.",
    SettingTextEasyChoice: "Easy Choice Bonus",
    SettingTextEaseChoiceDesc: "When you choose an easy option, it postpones the next review time. A larger value leads to a longer delay for the next review. Recommended: 1.",
    SettingTextHardChoice: "Hard Choice Bonus",
    SettingTextHardChoiceDesc: "When you choose a hard option, it advances the next review time. A larger value results in an earlier next review. Recommended: 1.",
    SettingTextWaitting: "Waiting Timeout Baseline",
    SettingTextWaittingDesc: "The waiting timeout serves two purposes: 1) During the waiting period, it forces you to spend time reviewing, contemplating, and memorizing. 2) More importantly, it helps you differentiate options more accurately. You'll find that when you have some idea about the answer, if you choose the wrong option, your penalty time becomes longer. Therefore, you're more likely to choose the appropriate option instead of randomly guessing the question, as this guessing is highly inaccurate. For example, when you're unsure about the answer, it's best to choose the 'Not Sure' option. Otherwise, if you choose the 'Known' option but the answer is wrong, the waiting time will be lengthy. You can adjust this option based on your own situation to extend or shorten the duration of the waiting timeout, or you can disable it entirely. Recommended values for the waiting timeout should be the number of seconds it takes for you to remember a six-letter word within three hours without forgetting it."
}

const zhTranslation = {
    // 初始界面
    StartTextLearn: "强化学习",
    StartTextNew: "新内容",
    StartTextReview: "复习",
    StartTextEmpty: "棒棒哒，你已经完成了所有的复习！现在，是时候让这些知识沉淀其中了。您的下一个复习周期将很快可用。在那之前，你可以随意添加更多的卡片来继续你的学习。",
    // 卡片界面 阶段一 记忆程度
    ButtonTextForget: "忘记了", // 忘记了
    ButtonNotSure: "不确定", // 不确定
    ButtonTextKnown: "我知道", // 我知道
    // 卡片界面 阶段二 正确还是错误
    ButtonTextForget2: "知道了", // 忘记了,现在我知道了
    ButtonTextHard: "稍难", // 有点难
    ButtonTextFair: "尚可", // 还行
    ButtonTextEasy: "简单",    // 简单
    ButtonTextWrong: "记错了",  // 记错了
    // 按钮区域
    ButtonTextSkip: "略过", // 忽略 下一个
    ButtonTextOpenFile: "打开文件", // 打开所在文件
    ButtonTextOpenLast: "打开上一个", // 打开上一个的所在文件
    ClipTextEase: "容易度", // 是否容易, 越大越容易
    // 配置文件
    SettingTextAosrSettings: "Aosr配置",
    SettingTextInitEase: "初始容易度",
    SettingTextInitEaseDesc: "复习频率的基线。复习间隔为 (该值/100) * 距离上次复习的时间。数字越小，复习频率越高。建议：250。",
    SettingTextEasyChoice: "简单选项加成",
    SettingTextEaseChoiceDesc: "当您选择简单选项时，推迟下次复习时间。它越大，下次复习就会越晚。建议：1。",
    SettingTextHardChoice: "困难选项加成",
    SettingTextHardChoiceDesc: "当您选择困难选项时，提早下次复习时间。它越大，下次复习就会越早。建议：1。",
    SettingTextWaitting: "等待超时基准",
    SettingTextWaittingDesc: "等待超时有两个目的：1)在等待期间，它迫使你花时间复习、思考和记忆。2)更重要的是，它可以帮助您更准确地区分选项。你会发现，当你对答案有了一些想法时，如果你选择了错误的选项，你的惩罚时间会变得很长。因此，你更有可能选择合适的选项，而不是随机评估问题，因为这种评估非常不准确。例如，当您对答案不确定时，最好选择“不确定”选项。否则，如果你选择了“已知”选项，但答案是错误的，等待时间将会很长。您可以根据自己的情况调整此选项以延长或缩短等待超时的持续时间，也可以完全关闭等待。\n等待超时的推荐设置值，应该是您在三个小时内记住一个六个字母的单词并不忘记它的秒数。"
}

export function addTranslation(key: string, translations: any) {
    const languages = ['en', 'zh', 'ja', 'zh-TW', 'ko', 'ar', 'pt', 'de', 'ru', 'fr', 'es', 'it', 'id', 'ro', 'cs', 'no', 'pl', 'uk', 'sq', 'th', 'fa', 'tr', 'nl', 'ms', 'pt-BR', 'am', 'da'];
    languages.forEach(lang => {
        if (translations[lang]) {
            i18n.addResourceBundle(lang, 'translation', {
                [key]: translations[lang],
            }, true, true);
        }
    });
}

export function initLanguage() {
    i18n.use(initReactI18next).init(
        {
            resources: {
                en: {
                    translation: enTranslation
                },
                zh: {
                    translation: zhTranslation
                },
                ja: {
                    translation: jpTranslation
                },
                'zh-TW': {
                    translation: twTranslation
                },
                ko: {
                    translation: koTranslation
                },
                ar: {
                    translation: arTranslation
                },
                pt: {
                    translation: ptTranslation
                },
                de: {
                    translation: deTranslation
                },
                ru: {
                    translation: ruTranslation
                },
                fr: {
                    translation: frTranslation
                },
                es: {
                    translation: esTranslation
                },
                it: {
                    translation: itTranslation
                },
                id: {
                    translation: idTranslation
                },
                ro: {
                    translation: roTranslation
                },
                cs: {
                    translation: csTranslation
                },
                no: {
                    translation: noTranslation
                },
                pl: {
                    translation: plTranslation
                },
                uk: {
                    translation: ukTranslation
                },
                sq: {
                    translation: sqTranslation
                },
                th: {
                    translation: thTranslation
                },
                fa: {
                    translation: faTranslation
                },
                tr: {
                    translation: trTranslation
                },
                nl: {
                    translation: nlTranslation
                },
                ms: {
                    translation: msTranslation
                },
                'pt-BR': {
                    translation: ptBRTranslation
                },
                am: {
                    translation: amTranslation
                },
                da: {
                    translation: daTranslation
                }
            },
            lng: 'en',
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false, // not needed for react as it escapes by default
            },
        }
    )
    addTranslation("TodayStats", todayStatic)
    addTranslation("StartReview", StartReview)
    const lang = window.localStorage.getItem('language') || "en"
    i18n.changeLanguage(lang).catch(err => {
        console.error('Failed to change language:', err);
    });
}

const frTranslation = {
    // Interface initiale
    StartTextLearn: "Renforcer l'apprentissage",
    StartTextNew: "Nouveau contenu",
    StartTextReview: "Révision",
    StartTextEmpty: "Excellent travail, vous avez terminé toutes vos révisions ! Maintenant, il est temps de laisser ces connaissances s'imprégner. Votre prochain cycle de révision sera bientôt disponible. En attendant, n'hésitez pas à ajouter plus de cartes pour poursuivre votre apprentissage.",
    // Interface de la carte - Étape 1 : degré de mémorisation
    ButtonTextForget: "Oublié", // Oublié
    ButtonNotSure: "Pas sûr", // Pas sûr
    ButtonTextKnown: "Je sais", // Je sais
    // Interface de la carte - Étape 2 : correct ou faux
    ButtonTextForget2: "Compris", // Oublié, mais maintenant je l'ai compris
    ButtonTextHard: "Difficile", // Un peu difficile
    ButtonTextFair: "Correct", // Correct
    ButtonTextEasy: "Facile", // Facile
    ButtonTextWrong: "Mauvais souvenir", // Mauvais souvenir
    // Zone des boutons
    ButtonTextSkip: "Passer", // Passer à la suivante
    ButtonTextOpenFile: "Ouvrir le fichier", // Ouvrir l'emplacement du fichier
    ButtonTextOpenLast: "Ouvrir le précédent", // Ouvrir l'emplacement du fichier précédent
    ClipTextEase: "Facilité de rappel", // Facilité de rappel, une valeur plus élevée indique une plus grande facilité
    // Fichier de configuration
    SettingTextAosrSettings: "Paramètres pour Aosr",
    SettingTextInitEase: "Facilité initiale",
    SettingTextInitEaseDesc: "La fréquence de révision de base. L'intervalle de révision est calculé comme (cette valeur/100) * temps depuis la dernière révision. Un nombre plus petit entraîne une fréquence de révision plus élevée. Recommandé : 250.",
    SettingTextEasyChoice: "Bonus choix facile",
    SettingTextEaseChoiceDesc: "Lorsque vous choisissez une option facile, cela reporte le prochain moment de révision. Une valeur plus grande entraîne un délai plus long avant la prochaine révision. Recommandé : 1.",
    SettingTextHardChoice: "Bonus choix difficile",
    SettingTextHardChoiceDesc: "Lorsque vous choisissez une option difficile, cela avance le prochain moment de révision. Une valeur plus grande entraîne une révision plus précoce. Recommandé : 1.",
    SettingTextWaitting: "Temps d'attente de base",
    SettingTextWaittingDesc: "Le temps d'attente sert à deux fins : 1) Pendant la période d'attente, il vous force à passer du temps à réviser, à réfléchir et à mémoriser. 2) Plus important encore, il vous aide à différencier les options plus précisément. Vous constaterez que lorsque vous avez une idée de la réponse, si vous choisissez la mauvaise option, votre temps de pénalité devient plus long. Par conséquent, vous êtes plus susceptible de choisir l'option appropriée au lieu de deviner aléatoirement la question, car cette supposition est très imprécise. Par exemple, lorsque vous n'êtes pas sûr de la réponse, il est préférable de choisir l'option 'Pas sûr'. Sinon, si vous choisissez l'option 'Je sais' mais que la réponse est fausse, le temps d'attente sera long. Vous pouvez ajuster cette option en fonction de votre propre situation pour prolonger ou raccourcir la durée du temps d'attente, ou vous pouvez le désactiver complètement. Les valeurs recommandées pour le temps d'attente devraient être le nombre de secondes qu'il vous faut pour vous souvenir d'un mot de six lettres en moins de trois heures sans l'oublier."
}

// 西班牙语
const esTranslation = {
    // Interfaz inicial
    StartTextLearn: "Refuerzo de aprendizaje",
    StartTextNew: "Contenido nuevo",
    StartTextReview: "Revisión",
    StartTextEmpty: "¡Buen trabajo, has completado todas tus revisiones! Ahora es el momento de dejar que este conocimiento se asiente. Tu próximo ciclo de revisión estará disponible pronto. Mientras tanto, siéntete libre de añadir más tarjetas para seguir aprendiendo.",
    // Interfaz de tarjeta - Etapa uno: grado de memorización
    ButtonTextForget: "Olvidé", // Olvidé
    ButtonNotSure: "No estoy seguro", // No estoy seguro
    ButtonTextKnown: "Lo sé", // Lo sé
    // Interfaz de tarjeta - Etapa dos: correcto o incorrecto
    ButtonTextForget2: "Entendido", // Olvidé, pero ahora lo entiendo
    ButtonTextHard: "Difícil", // Un poco difícil
    ButtonTextFair: "Correcto", // Correcto
    ButtonTextEasy: "Fácil", // Fácil
    ButtonTextWrong: "Recordé mal", // Recordé mal
    // Área de botones
    ButtonTextSkip: "Saltar", // Saltar al siguiente
    ButtonTextOpenFile: "Abrir archivo", // Abrir la ubicación del archivo
    ButtonTextOpenLast: "Abrir último", // Abrir la ubicación del archivo anterior
    ClipTextEase: "Facilidad de recordar", // Facilidad de recordar, un valor más alto indica que es más fácil
    // Archivo de configuración
    SettingTextAosrSettings: "Configuración de Aosr",
    SettingTextInitEase: "Facilidad inicial",
    SettingTextInitEaseDesc: "La base para la frecuencia de revisión. El intervalo de revisión se calcula como (este valor/100) * tiempo transcurrido desde la última revisión. Un número más pequeño resulta en una frecuencia de revisión más alta. Recomendado: 250.",
    SettingTextEasyChoice: "Bonificación elección fácil",
    SettingTextEaseChoiceDesc: "Cuando eliges una opción fácil, se pospone el siguiente momento de revisión. Un valor más grande lleva a un mayor retraso para la siguiente revisión. Recomendado: 1.",
    SettingTextHardChoice: "Bonificación elección difícil",
    SettingTextHardChoiceDesc: "Cuando eliges una opción difícil, se adelanta el siguiente momento de revisión. Un valor más grande resulta en una revisión más temprana. Recomendado: 1.",
    SettingTextWaitting: "Tiempo de espera base",
    SettingTextWaittingDesc: "El tiempo de espera sirve para dos propósitos: 1) Durante el período de espera, te obliga a pasar tiempo revisando, reflexionando y memorizando. 2) Más importante aún, te ayuda a diferenciar las opciones con más precisión. Notarás que cuando tienes alguna idea sobre la respuesta, si eliges la opción incorrecta, tu tiempo de penalización será más largo. Por lo tanto, es más probable que elijas la opción adecuada en lugar de adivinar al azar la pregunta, ya que esta suposición es muy imprecisa. Por ejemplo, cuando no estás seguro de la respuesta, es mejor elegir la opción 'No estoy seguro'. De lo contrario, si eliges la opción 'Lo sé' pero la respuesta es incorrecta, el tiempo de espera será largo. Puedes ajustar esta opción según tu situación para prolongar o acortar la duración del tiempo de espera, o puedes desactivarlo por completo. Los valores recomendados para el tiempo de espera deben ser el número de segundos que te toma recordar una palabra de seis letras dentro de tres horas sin olvidarla."
}

const jpTranslation = {
    // 初期インターフェース
    StartTextLearn: "学習を強化",
    StartTextNew: "新しいコンテンツ",
    StartTextReview: "復習",
    StartTextEmpty: "おめでとうございます！すべての復習を完了しました。これらの知識を定着させる時間です。次の復習サイクルはまもなく利用可能になります。その間、学習を継続するためにカードを追加してみてください。",
    // カードインターフェース ステージ1 - 記憶度合い
    ButtonTextForget: "忘れた", // 忘れた
    ButtonNotSure: "わからない", // わからない
    ButtonTextKnown: "知っている", // 知っている
    // カードインターフェース ステージ2 - 正解か不正解か
    ButtonTextForget2: "わかった", // 忘れたが、今わかった
    ButtonTextHard: "難しい", // 少し難しい
    ButtonTextFair: "まあまあ", // まあまあ
    ButtonTextEasy: "簡単", // 簡単
    ButtonTextWrong: "覚え違い", // 覚え違い
    // ボタン領域
    ButtonTextSkip: "スキップ", // 次にスキップ
    ButtonTextOpenFile: "ファイルを開く", // ファイルの場所を開く
    ButtonTextOpenLast: "前を開く", // 前のファイルの場所を開く
    ClipTextEase: "思い出しやすさ", // 思い出しやすさ、値が大きいほど容易
    // 設定ファイル
    SettingTextAosrSettings: "Aosrの設定",
    SettingTextInitEase: "初期の思い出しやすさ",
    SettingTextInitEaseDesc: "復習の頻度の基準です。復習間隔は（この値/100）×前回の復習からの時間で計算されます。数値が小さいほど、復習の頻度が高くなります。推奨値：250。",
    SettingTextEasyChoice: "簡単な選択ボーナス",
    SettingTextEaseChoiceDesc: "簡単なオプションを選択すると、次回の復習時間が延期されます。値が大きいほど、次回の復習までの遅延が長くなります。推奨値：1。",
    SettingTextHardChoice: "難しい選択ボーナス",
    SettingTextHardChoiceDesc: "難しいオプションを選択すると、次回の復習時間が前倒しされます。値が大きいほど、次回の復習が早くなります。推奨値：1。",
    SettingTextWaitting: "待機タイムアウトの基準",
    SettingTextWaittingDesc: "待機タイムアウトには2つの目的があります。1）待機期間中、復習、考察、記憶に時間を費やすように強制します。2）さらに重要なのは、オプションの選択をより正確に区別するのに役立ちます。回答についてある程度の考えを持っている場合、誤ったオプションを選択するとペナルティの時間が長くなります。したがって、答えをランダムに推測するのではなく、適切なオプションを選択する可能性が高くなります。たとえば、回答に自信がない場合は、「わからない」オプションを選択するのが最適です。さもなければ、「知っている」オプションを選択しますが、回答が間違っている場合、待機時間が長くなります。自身の状況に合わせてこのオプションを調整して、待機タイムアウトの長さを延長または短縮するか、完全に無効にすることができます。待機タイムアウトの推奨値は、3時間以内に6文字の単語を覚えて忘れない秒数です。"
}

const twTranslation = {
    // 初始界面
    StartTextLearn: "強化學習",
    StartTextNew: "新內容",
    StartTextReview: "複習",
    StartTextEmpty: "太棒了，你已經完成所有的複習！現在，是時候讓這些知識沉澱其中了。你的下一個複習週期將很快可用。在那之前，你可以隨意添加更多的卡片來繼續學習。",
    // 卡片界面 階段一 - 記憶程度
    ButtonTextForget: "忘記了", // 忘記了
    ButtonNotSure: "不確定", // 不確定
    ButtonTextKnown: "我知道", // 我知道
    // 卡片界面 階段二 - 正確還是錯誤
    ButtonTextForget2: "知道了", // 忘記了，現在我知道了
    ButtonTextHard: "稍難", // 有點難
    ButtonTextFair: "尚可", // 尚可
    ButtonTextEasy: "簡單", // 簡單
    ButtonTextWrong: "記錯了", // 記錯了
    // 按鈕區域
    ButtonTextSkip: "略過", // 略過到下一個
    ButtonTextOpenFile: "開啟檔案", // 開啟檔案位置
    ButtonTextOpenLast: "開啟上一個", // 開啟上一個的檔案位置
    ClipTextEase: "回憶容易度", // 回憶容易度，數值越大表示越容易
    // 設定檔案
    SettingTextAosrSettings: "Aosr設定",
    SettingTextInitEase: "初始容易度",
    SettingTextInitEaseDesc: "複習頻率的基準。複習間隔計算為 (該值/100) * 距離上次複習的時間。較小的數字導致較高的複習頻率。建議：250。",
    SettingTextEasyChoice: "簡單選項加成",
    SettingTextEaseChoiceDesc: "當你選擇簡單選項時，它延後了下次複習時間。較大的數值導致下次複習的延遲時間更長。建議：1。",
    SettingTextHardChoice: "困難選項加成",
    SettingTextHardChoiceDesc: "當你選擇困難選項時，它提前了下次複習時間。較大的數值導致下次複習更早進行。建議：1。",
    SettingTextWaitting: "等待超時基準",
    SettingTextWaittingDesc: "等待超時有兩個目的：1）在等待期間，它強迫你花時間複習、思考和記憶。2）更重要的是，它幫助你更準確地區分選項。你會發現，當你對答案有一些想法時，如果你選擇了錯誤的選項，懲罰時間會變得更長。因此，你更有可能選擇適當的選項，而不是隨機猜測問題，因為這種猜測非常不準確。例如，當你對答案不確定時，最好選擇「不確定」選項。否則，如果你選擇「我知道」選項但答案是錯誤的，等待時間會很長。你可以根據自己的情況調整該選項，延長或縮短等待超時的持續時間，或完全禁用它。推薦的等待超時值應該是你在三小時內記住一個六個字母的詞且不忘記的秒數。"
}


const koTranslation = {
    // 초기 인터페이스
    StartTextLearn: "학습 강화",
    StartTextNew: "새로운 내용",
    StartTextReview: "복습",
    StartTextEmpty: "좋아요, 모든 복습을 완료했어요! 이제 이 지식이 잘 스며들게 해주세요. 다음 복습 주기는 곧 이용 가능할 거예요. 그 동안 학습을 계속하려면 카드를 추가해보세요.",
    // 카드 인터페이스 - 단계 1: 기억 정도
    ButtonTextForget: "잊어버렸어요", // 잊어버렸어요
    ButtonNotSure: "확실하지 않아요", // 확실하지 않아요
    ButtonTextKnown: "알아요", // 알아요
    // 카드 인터페이스 - 단계 2: 정답 또는 오답
    ButtonTextForget2: "알겠어요", // 잊어버렸지만 이제 알겠어요
    ButtonTextHard: "조금 어려워요", // 조금 어려워요
    ButtonTextFair: "괜찮아요", // 괜찮아요
    ButtonTextEasy: "쉬워요", // 쉬워요
    ButtonTextWrong: "잘못 기억했어요", // 잘못 기억했어요
    // 버튼 영역
    ButtonTextSkip: "건너뛰기", // 다음으로 건너뛰기
    ButtonTextOpenFile: "파일 열기", // 파일 위치 열기
    ButtonTextOpenLast: "이전 열기", // 이전 파일 위치 열기
    ClipTextEase: "회상 용이성", // 회상 용이성, 값이 클수록 쉬워요
    // 설정 파일
    SettingTextAosrSettings: "Aosr 설정",
    SettingTextInitEase: "초기 용이성",
    SettingTextInitEaseDesc: "복습 주기의 기준입니다. 복습 간격은 (이 값/100) * 마지막 복습 이후 시간으로 계산됩니다. 숫자가 작을수록 복습 주기가 높아집니다. 권장값: 250.",
    SettingTextEasyChoice: "쉬운 선택 보너스",
    SettingTextEaseChoiceDesc: "쉬운 옵션을 선택하면 다음 복습 시간이 연기됩니다. 값이 클수록 다음 복습까지의 지연이 길어집니다. 권장값: 1.",
    SettingTextHardChoice: "어려운 선택 보너스",
    SettingTextHardChoiceDesc: "어려운 옵션을 선택하면 다음 복습 시간이 앞당겨집니다. 값이 클수록 다음 복습이 빨리 진행됩니다. 권장값: 1.",
    SettingTextWaitting: "대기 시간 제한 기준",
    SettingTextWaittingDesc: "대기 시간 제한은 두 가지 목적을 가지고 있습니다. 1) 대기 기간 동안, 복습, 고찰, 기억에 시간을 할애하도록 합니다. 2) 더 중요한 것은, 옵션을 보다 정확하게 구분할 수 있도록 도와줍니다. 답안에 대해 어느 정도 생각이 있을 때, 잘못된 옵션을 선택하면 처벌 시간이 길어집니다. 그래서 무작위로 추측하는 대신 올바른 옵션을 선택할 확률이 높아집니다. 예를 들어, 답안에 확신이 없을 때는 '확실하지 않아요' 옵션을 선택하는 것이 가장 좋습니다. 그렇지 않으면 '알아요' 옵션을 선택하지만 답안이 틀린 경우, 대기 시간이 길어집니다. 자신의 상황에 맞게 이 옵션을 조정하여 대기 시간의 기간을 연장하거나 축소할 수 있으며, 필요에 따라 완전히 비활성화할 수 있습니다. 대기 시간의 권장 값은 세 시간 내에 6글자 단어를 기억하고 잊지 않는 데 걸리는 시간입니다."
}

const arTranslation = {
    // واجهة البداية
    StartTextLearn: "تعزيز التعلم",
    StartTextNew: "محتوى جديد",
    StartTextReview: "مراجعة",
    StartTextEmpty: "عمل رائع، لقد أكملت جميع المراجعات الخاصة بك! الآن حان وقت ترسيخ هذه المعرفة. ستتوفر دورة المراجعة التالية قريبًا. في هذه الأثناء، لا تتردد في إضافة المزيد من البطاقات لمواصلة التعلم.",
    // واجهة البطاقة - المرحلة الأولى: درجة التذكر
    ButtonTextForget: "نسيت", // نسيت
    ButtonNotSure: "غير متأكد", // غير متأكد
    ButtonTextKnown: "أعرف", // أعرف
    // واجهة البطاقة - المرحلة الثانية: صحيح أم خاطئ
    ButtonTextForget2: "فهمت", // نسيت، لكنني فهمت الآن
    ButtonTextHard: "صعب", // صعب قليلاً
    ButtonTextFair: "مقبول", // مقبول
    ButtonTextEasy: "سهل", // سهل
    ButtonTextWrong: "تذكرت بشكل خاطئ", // تذكرت بشكل خاطئ
    // منطقة الأزرار
    ButtonTextSkip: "تخطي", // الانتقال إلى التالي
    ButtonTextOpenFile: "فتح الملف", // فتح موقع الملف
    ButtonTextOpenLast: "فتح السابق", // فتح موقع الملف السابق
    ClipTextEase: "سهولة الاستدعاء", // سهولة الاستدعاء، القيمة الأعلى تشير إلى سهولة أكبر
    // ملف التكوين
    SettingTextAosrSettings: "إعدادات Aosr",
    SettingTextInitEase: "سهولة البداية",
    SettingTextInitEaseDesc: "القاعدة لتردد المراجعة. يتم حساب فترة المراجعة بواسطة (هذا القيمة/100) × الوقت منذ المراجعة السابقة. الأرقام الأصغر تؤدي إلى تردد مراجعة أعلى. المقترح: 250.",
    SettingTextEasyChoice: "مكافأة الاختيار السهل",
    SettingTextEaseChoiceDesc: "عندما تختار خيارًا سهلًا، يتأخر وقت المراجعة التالي. القيمة الأعلى تؤدي إلى تأخير أطول للمراجعة التالية. المقترح: 1.",
    SettingTextHardChoice: "مكافأة الاختيار الصعب",
    SettingTextHardChoiceDesc: "عندما تختار خيارًا صعبًا، يتقدم وقت المراجعة التالي. القيمة الأعلى تؤدي إلى مراجعة أقرب في الوقت. المقترح: 1.",
    SettingTextWaitting: "الحد الزمني للانتظار",
    SettingTextWaittingDesc: "الحد الزمني للانتظار يخدم هدفين: 1) خلال فترة الانتظار، يجبرك على قضاء وقت في المراجعة والتأمل والتذكر. 2) الأهم من ذلك، يساعدك على التمييز بين الخيارات بدقة أكبر. ستلاحظ أنه عندما يكون لديك بعض الأفكار حول الإجابة، إذا اخترت الخيار الخاطئ، فإن وقت العقوبة سيكون أطول. لذا، فمن المرجح أن تختار الخيار المناسب بدلاً من التخمين العشوائي للسؤال، حيث يكون هذا التخمين غير دقيق جدًا. على سبيل المثال، عندما تكون غير متأكد من الإجابة، فمن الأفضل اختيار الخيار 'غير متأكد'. وإلا، إذا اخترت الخيار 'أعرف' وكانت الإجابة خاطئة، فإن وقت الانتظار سيكون طويلًا. يمكنك ضبط هذا الخيار استنادًا إلى وضعك الشخصي لتمديد أو تقصير مدة الانتظار، أو يمكنك تعطيله تمامًا. القيم المقترحة للحد الزمني للانتظار يجب أن تكون عدد الثواني اللازمة لتذكر كلمة من ستة أحرف في غضون ثلاث ساعات دون نسيانها."
}

const ptTranslation = {
    // Interface Inicial
    StartTextLearn: "Reforçar Aprendizagem",
    StartTextNew: "Novo Conteúdo",
    StartTextReview: "Revisão",
    StartTextEmpty: "Ótimo trabalho, você concluiu todas as revisões! Agora é hora de deixar esse conhecimento fixar. Seu próximo ciclo de revisão estará disponível em breve. Até lá, sinta-se à vontade para adicionar mais cartões para continuar aprendendo.",
    // Interface do Cartão - Estágio 1: Grau de Memorização
    ButtonTextForget: "Esqueci", // Esqueci
    ButtonNotSure: "Não Tenho Certeza", // Não tenho certeza
    ButtonTextKnown: "Eu Sei", // Eu sei
    // Interface do Cartão - Estágio 2: Correto ou Errado
    ButtonTextForget2: "Entendi", // Esqueci, mas agora entendi
    ButtonTextHard: "Difícil", // Um pouco difícil
    ButtonTextFair: "Ok", // Ok
    ButtonTextEasy: "Fácil", // Fácil
    ButtonTextWrong: "Errei", // Errei
    // Área dos Botões
    ButtonTextSkip: "Pular", // Pular para o próximo
    ButtonTextOpenFile: "Abrir Arquivo", // Abrir localização do arquivo
    ButtonTextOpenLast: "Abrir Último", // Abrir localização do arquivo anterior
    ClipTextEase: "Facilidade de Recordação", // Facilidade de recordação, valor maior indica mais fácil
    // Arquivo de Configuração
    SettingTextAosrSettings: "Configurações do Aosr",
    SettingTextInitEase: "Facilidade Inicial",
    SettingTextInitEaseDesc: "A referência para a frequência de revisão. O intervalo de revisão é calculado como (esse valor/100) * tempo desde a última revisão. Um número menor resulta em uma frequência de revisão maior. Recomendado: 250.",
    SettingTextEasyChoice: "Bônus de Opção Fácil",
    SettingTextEaseChoiceDesc: "Quando você escolhe uma opção fácil, adia o próximo horário de revisão. Um valor maior leva a um intervalo mais longo até a próxima revisão. Recomendado: 1.",
    SettingTextHardChoice: "Bônus de Opção Difícil",
    SettingTextHardChoiceDesc: "Quando você escolhe uma opção difícil, adianta o próximo horário de revisão. Um valor maior resulta em uma revisão mais adiantada. Recomendado: 1.",
    SettingTextWaitting: "Tempo Limite de Espera",
    SettingTextWaittingDesc: "O tempo limite de espera tem dois propósitos: 1) Durante o período de espera, ele força você a gastar tempo revisando, contemplando e memorizando. 2) Mais importante, ele ajuda a diferenciar as opções com mais precisão. Você perceberá que, quando tem alguma ideia sobre a resposta, se você escolher a opção errada, seu tempo de penalidade se torna mais longo. Portanto, é mais provável que você escolha a opção apropriada em vez de adivinhar aleatoriamente a questão, pois essa adivinhação é altamente imprecisa. Por exemplo, quando você não tem certeza sobre a resposta, é melhor escolher a opção 'Não Tenho Certeza'. Caso contrário, se você escolher a opção 'Eu Sei', mas a resposta estiver errada, o tempo de espera será longo. Você pode ajustar essa opção com base em sua própria situação para estender ou encurtar a duração do tempo limite de espera, ou pode desativá-lo completamente. Os valores recomendados para o tempo limite de espera devem ser o número de segundos que leva para você se lembrar de uma palavra de seis letras dentro de três horas sem esquecê-la."
}

const deTranslation = {
    // Initial Interface
    StartTextLearn: "Lernen verstärken",
    StartTextNew: "Neuer Inhalt",
    StartTextReview: "Wiederholung",
    StartTextEmpty: "Gut gemacht, du hast alle deine Wiederholungen abgeschlossen! Jetzt ist es an der Zeit, dieses Wissen zu festigen. Dein nächster Wiederholungszyklus wird bald verfügbar sein. Bis dahin kannst du gerne weitere Karten hinzufügen, um dein Lernen fortzusetzen.",
    // Card Interface Stage One - Degree of Memorization
    ButtonTextForget: "Vergessen", // Vergessen
    ButtonNotSure: "Unsicher", // Unsicher
    ButtonTextKnown: "Ich weiß", // Ich weiß
    // Card Interface Stage Two - Correct or Wrong
    ButtonTextForget2: "Verstanden", // Vergessen, aber jetzt verstanden
    ButtonTextHard: "Schwierig", // Etwas schwierig
    ButtonTextFair: "Okay", // Okay
    ButtonTextEasy: "Leicht", // Leicht
    ButtonTextWrong: "Falsch erinnert", // Falsch erinnert
    // Button Area
    ButtonTextSkip: "Überspringen", // Zum nächsten überspringen
    ButtonTextOpenFile: "Datei öffnen", // Dateispeicherort öffnen
    ButtonTextOpenLast: "Letzte öffnen", // Dateispeicherort der vorherigen öffnen
    ClipTextEase: "Abrufleichtigkeit", // Abrufleichtigkeit, höherer Wert bedeutet einfacher
    // Configuration File
    SettingTextAosrSettings: "Aosr-Einstellungen",
    SettingTextInitEase: "Anfängliche Leichtigkeit",
    SettingTextInitEaseDesc: "Die Grundlage für die Wiederholungsfrequenz. Das Wiederholungsintervall wird berechnet als (dieser Wert/100) * Zeit seit der letzten Wiederholung. Eine kleinere Zahl führt zu einer höheren Wiederholungsfrequenz. Empfohlen: 250.",
    SettingTextEasyChoice: "Bonus für leichte Option",
    SettingTextEaseChoiceDesc: "Wenn du eine leichte Option wählst, wird der nächste Wiederholungszeitpunkt verschoben. Ein größerer Wert führt zu einer längeren Verzögerung bis zur nächsten Wiederholung. Empfohlen: 1.",
    SettingTextHardChoice: "Bonus für schwierige Option",
    SettingTextHardChoiceDesc: "Wenn du eine schwierige Option wählst, wird der nächste Wiederholungszeitpunkt vorgezogen. Ein größerer Wert führt zu einer früheren nächsten Wiederholung. Empfohlen: 1.",
    SettingTextWaitting: "Wartezeit-Basiswert",
    SettingTextWaittingDesc: "Die Wartezeit dient zwei Zwecken: 1) Während der Wartezeit zwingt sie dich dazu, Zeit mit dem Überprüfen, Nachdenken und Einprägen zu verbringen. 2) Noch wichtiger ist, dass sie dir hilft, die Optionen genauer zu unterscheiden. Du wirst feststellen, dass wenn du eine Idee über die Antwort hast, wenn du die falsche Option wählst, wird deine Strafzeit länger. Daher ist es wahrscheinlicher, dass du die richtige Option wählst, anstatt zufällig zu raten, da diese Vermutung sehr ungenau ist. Zum Beispiel, wenn du dir bei der Antwort unsicher bist, ist es am besten, die Option 'Unsicher' zu wählen. Andernfalls, wenn du die Option 'Ich weiß' wählst, aber die Antwort falsch ist, wird die Wartezeit lang sein. Du kannst diese Option basierend auf deiner eigenen Situation anpassen, um die Dauer der Wartezeit zu verlängern oder zu verkürzen oder sie ganz zu deaktivieren. Empfohlene Werte für die Wartezeit sollten die Anzahl der Sekunden sein, die du benötigst, um ein sechs Buchstaben langes Wort innerhalb von drei Stunden zu erinnern, ohne es zu vergessen."
}

const ruTranslation = {
    // Интерфейс начала
    StartTextLearn: "Усилить обучение",
    StartTextNew: "Новый материал",
    StartTextReview: "Повторение",
    StartTextEmpty: "Отличная работа, вы завершили все свои повторения! Теперь пришло время укрепить полученные знания. Ваш следующий цикл повторений будет скоро доступен. А пока вы можете добавить ещё карточки, чтобы продолжить обучение.",
    // Интерфейс карточки - Этап 1: Степень запоминания
    ButtonTextForget: "Забыл(а)", // Забыл(а)
    ButtonNotSure: "Не уверен(а)", // Не уверен(а)
    ButtonTextKnown: "Знаю", // Знаю
    // Интерфейс карточки - Этап 2: Правильно или неправильно
    ButtonTextForget2: "Понял(а)", // Забыл(а), но сейчас понял(а)
    ButtonTextHard: "Сложно", // Немного сложно
    ButtonTextFair: "Нормально", // Нормально
    ButtonTextEasy: "Легко", // Легко
    ButtonTextWrong: "Неправильно запомнил(а)", // Неправильно запомнил(а)
    // Область кнопок
    ButtonTextSkip: "Пропустить", // Пропустить до следующего
    ButtonTextOpenFile: "Открыть файл", // Открыть местоположение файла
    ButtonTextOpenLast: "Открыть последний", // Открыть местоположение предыдущего файла
    ClipTextEase: "Легкость воспоминания", // Легкость воспоминания, более высокое значение означает легче
    // Файл конфигурации
    SettingTextAosrSettings: "Настройки Aosr",
    SettingTextInitEase: "Начальная легкость",
    SettingTextInitEaseDesc: "Базовая частота повторений. Интервал повторения рассчитывается как (это значение/100) * время с последнего повторения. Меньшее число приводит к более высокой частоте повторений. Рекомендуется: 250.",
    SettingTextEasyChoice: "Бонус за легкий вариант",
    SettingTextEaseChoiceDesc: "Когда вы выбираете легкий вариант, откладывается следующее время повторения. Большее значение приводит к большему времени до следующего повторения. Рекомендуется: 1.",
    SettingTextHardChoice: "Бонус за сложный вариант",
    SettingTextHardChoiceDesc: "Когда вы выбираете сложный вариант, время до следующего повторения сокращается. Большее значение приводит к более раннему следующему повторению. Рекомендуется: 1.",
    SettingTextWaitting: "Базовое время ожидания",
    SettingTextWaittingDesc: "Время ожидания выполняет две функции: 1) Во время ожидания оно заставляет вас провести время на повторение, размышление и запоминание. 2) Более важно, оно помогает более точно различать варианты. Вы заметите, что если у вас есть представление об ответе, и если вы выберете неправильный вариант, время штрафа становится дольше. Поэтому вы скорее всего выберете подходящий вариант, а не просто угадывать, так как такая догадка очень неточна. Например, если вы не уверены в ответе, лучше выбрать вариант 'Не уверен(а)'. В противном случае, если вы выберете вариант 'Знаю', но ответ неверный, время ожидания будет длительным. Вы можете настроить этот параметр в соответствии со своей ситуацией, чтобы увеличить или уменьшить продолжительность времени ожидания, или полностью отключить его. Рекомендуемые значения для времени ожидания должны быть количеством секунд, необходимым для запоминания шестибуквенного слова в течение трёх часов без его забывания."
}

const itTranslation = {
    // Interfaccia Iniziale
    StartTextLearn: "Rafforza l'apprendimento",
    StartTextNew: "Nuovo Contenuto",
    StartTextReview: "Revisione",
    StartTextEmpty: "Ottimo lavoro, hai completato tutte le tue revisioni! Ora è il momento di consolidare queste conoscenze. Il tuo prossimo ciclo di revisione sarà presto disponibile. Nel frattempo, sentiti libero di aggiungere altre schede per continuare il tuo apprendimento.",
    // Interfaccia della Carta - Fase Uno: Grado di Memorizzazione
    ButtonTextForget: "Ho dimenticato", // Ho dimenticato
    ButtonNotSure: "Non Sono Sicuro", // Non sono sicuro
    ButtonTextKnown: "Lo So", // Lo so
    // Interfaccia della Carta - Fase Due: Corretto o Sbagliato
    ButtonTextForget2: "Ho capito", // Ho dimenticato, ma ora ho capito
    ButtonTextHard: "Difficile", // Un po' difficile
    ButtonTextFair: "Accettabile", // Accettabile
    ButtonTextEasy: "Facile", // Facile
    ButtonTextWrong: "Ho ricordato male", // Ho ricordato male
    // Area dei Pulsanti
    ButtonTextSkip: "Salta", // Salta al successivo
    ButtonTextOpenFile: "Apri File", // Apri la posizione del file
    ButtonTextOpenLast: "Apri l'Ultimo", // Apri la posizione del file precedente
    ClipTextEase: "Facilità di Recupero", // Facilità di recupero, valore più alto indica più facile
    // File di Configurazione
    SettingTextAosrSettings: "Impostazioni di Aosr",
    SettingTextInitEase: "Facilità Iniziale",
    SettingTextInitEaseDesc: "La base per la frequenza di revisione. L'intervallo di revisione viene calcolato come (questo valore/100) * tempo trascorso dall'ultima revisione. Un numero più piccolo porta a una frequenza di revisione più alta. Consigliato: 250.",
    SettingTextEasyChoice: "Bonus per la Scelta Facile",
    SettingTextEaseChoiceDesc: "Quando scegli un'opzione facile, viene posticipato il prossimo momento di revisione. Un valore più alto porta a un ritardo maggiore per la prossima revisione. Consigliato: 1.",
    SettingTextHardChoice: "Bonus per la Scelta Difficile",
    SettingTextHardChoiceDesc: "Quando scegli un'opzione difficile, viene anticipato il prossimo momento di revisione. Un valore più alto porta a una revisione anticipata. Consigliato: 1.",
    SettingTextWaitting: "Timeout di Attesa",
    SettingTextWaittingDesc: "Il timeout di attesa serve a due scopi: 1) Durante il periodo di attesa, ti costringe a dedicare del tempo alla revisione, alla riflessione e alla memorizzazione. 2) Inoltre, ti aiuta a distinguere più accuratamente le opzioni. Noterai che quando hai un'idea sulla risposta, se scegli l'opzione sbagliata, il tempo di penalità diventa più lungo. Pertanto, è più probabile che tu scelga l'opzione appropriata invece di indovinare casualmente la risposta, poiché questo tipo di indovinare è molto impreciso. Ad esempio, quando non sei sicuro sulla risposta, è meglio scegliere l'opzione 'Non Sono Sicuro'. In caso contrario, se scegli l'opzione 'Lo So', ma la risposta è sbagliata, il timeout sarà lungo. Puoi regolare questa opzione in base alla tua situazione personale per estendere o abbreviare la durata del timeout di attesa, o puoi disabilitarlo completamente. I valori consigliati per il timeout di attesa dovrebbero essere il numero di secondi necessari per ricordare una parola di sei lettere entro tre ore senza dimenticarla."
}
// 印尼
const idTranslation = {
    // Antarmuka Awal
    StartTextLearn: "Perkuat Pembelajaran",
    StartTextNew: "Konten Baru",
    StartTextReview: "Ulangan",
    StartTextEmpty: "Selamat, Anda telah menyelesaikan semua ulangan Anda! Sekarang saatnya untuk menguatkan pengetahuan ini. Siklus ulangan berikutnya akan segera tersedia. Sementara itu, jangan ragu untuk menambahkan kartu-kartu lain untuk melanjutkan pembelajaran Anda.",
    // Antarmuka Kartu - Tahap Satu: Derajat Mengingat
    ButtonTextForget: "Lupa", // Lupa
    ButtonNotSure: "Tidak Yakin", // Tidak yakin
    ButtonTextKnown: "Saya Tahu", // Saya tahu
    // Antarmuka Kartu - Tahap Dua: Benar atau Salah
    ButtonTextForget2: "Paham", // Lupa, tapi sekarang paham
    ButtonTextHard: "Sulit", // Agak sulit
    ButtonTextFair: "Cukup", // Cukup baik
    ButtonTextEasy: "Mudah", // Mudah
    ButtonTextWrong: "Tersalah Ingat", // Tersalah ingat
    // Area Tombol
    ButtonTextSkip: "Lewati", // Lewati ke berikutnya
    ButtonTextOpenFile: "Buka Berkas", // Buka lokasi berkas
    ButtonTextOpenLast: "Buka Terakhir", // Buka lokasi berkas sebelumnya
    ClipTextEase: "Kemudahan Mengingat", // Kemudahan mengingat, nilai yang lebih tinggi menandakan lebih mudah
    // Berkas Konfigurasi
    SettingTextAosrSettings: "Pengaturan Aosr",
    SettingTextInitEase: "Kemudahan Awal",
    SettingTextInitEaseDesc: "Dasar untuk frekuensi ulangan. Interval ulangan dihitung sebagai (nilai ini/100) * waktu sejak ulangan terakhir. Angka yang lebih kecil menghasilkan frekuensi ulangan yang lebih tinggi. Disarankan: 250.",
    SettingTextEasyChoice: "Bonus Pilihan Mudah",
    SettingTextEaseChoiceDesc: "Ketika Anda memilih pilihan mudah, waktu ulangan berikutnya ditunda. Nilai yang lebih tinggi menghasilkan penundaan yang lebih lama untuk ulangan berikutnya. Disarankan: 1.",
    SettingTextHardChoice: "Bonus Pilihan Sulit",
    SettingTextHardChoiceDesc: "Ketika Anda memilih pilihan sulit, waktu ulangan berikutnya dipercepat. Nilai yang lebih tinggi menghasilkan ulangan yang lebih awal. Disarankan: 1.",
    SettingTextWaitting: "Batas Waktu Tunggu",
    SettingTextWaittingDesc: "Waktu tunggu memiliki dua tujuan: 1) Selama periode tunggu, ini memaksa Anda untuk menghabiskan waktu untuk ulangan, merenung, dan mengingat. 2) Yang lebih penting, ini membantu Anda membedakan pilihan dengan lebih akurat. Anda akan menemukan bahwa ketika Anda memiliki sedikit gagasan tentang jawabannya, jika Anda memilih opsi yang salah, waktu hukuman menjadi lebih lama. Oleh karena itu, lebih mungkin Anda memilih opsi yang sesuai daripada menebak secara acak, karena tebakan semacam itu sangat tidak akurat. Misalnya, ketika Anda tidak yakin tentang jawabannya, lebih baik pilih opsi 'Tidak Yakin'. Jika tidak, jika Anda memilih opsi 'Saya Tahu', tetapi jawabannya salah, waktu tunggu akan menjadi lama. Anda dapat menyesuaikan opsi ini berdasarkan situasi Anda sendiri untuk memperpanjang atau memperpendek durasi batas waktu tunggu, atau Anda dapat menonaktifkannya sepenuhnya. Nilai yang disarankan untuk batas waktu tunggu adalah jumlah detik yang dibutuhkan untuk mengingat sebuah kata berjumlah enam huruf dalam waktu tiga jam tanpa melupakannya."
}
// 罗马尼亚
const roTranslation = {
    // Interfață Inițială
    StartTextLearn: "Consolidare Învățare",
    StartTextNew: "Conținut Nou",
    StartTextReview: "Repetare",
    StartTextEmpty: "Felicitări, ai finalizat toate repetările! Acum este momentul să-ți consolidezi cunoștințele. Următorul ciclu de repetare va fi disponibil în curând. Până atunci, poți adăuga noi carduri pentru a continua procesul de învățare.",
    // Interfață Card - Etapa Unu: Grad de Memorare
    ButtonTextForget: "Am uitat", // Am uitat
    ButtonNotSure: "Nu sunt sigur", // Nu sunt sigur
    ButtonTextKnown: "Știu", // Știu
    // Interfață Card - Etapa Doi: Corect sau Greșit
    ButtonTextForget2: "Am înțeles", // Am uitat, dar acum am înțeles
    ButtonTextHard: "Dificil", // Puțin dificil
    ButtonTextFair: "Ok", // Ok
    ButtonTextEasy: "Ușor", // Ușor
    ButtonTextWrong: "Am reținut greșit", // Am reținut greșit
    // Zonă Buton
    ButtonTextSkip: "Omite", // Sări la următorul
    ButtonTextOpenFile: "Deschide Fișierul", // Deschide locația fișierului
    ButtonTextOpenLast: "Deschide Ultimul", // Deschide locația fișierului anterior
    ClipTextEase: "Ușurința de Redare", // Ușurința de redare, valoarea mai mare indică mai ușor
    // Fișier Configurare
    SettingTextAosrSettings: "Setări Aosr",
    SettingTextInitEase: "Ușurință Inițială",
    SettingTextInitEaseDesc: "Baza pentru frecvența de repetare. Intervalul de repetare este calculat ca (acestă valoare/100) * timpul de la ultima repetare. Un număr mai mic rezultă într-o frecvență mai mare de repetare. Recomandat: 250.",
    SettingTextEasyChoice: "Bonus pentru Opțiunea Ușoară",
    SettingTextEaseChoiceDesc: "Atunci când alegi o opțiune ușoară, se amână momentul următoarei repetări. O valoare mai mare duce la o amânare mai mare a următoarei repetări. Recomandat: 1.",
    SettingTextHardChoice: "Bonus pentru Opțiunea Dificilă",
    SettingTextHardChoiceDesc: "Atunci când alegi o opțiune dificilă, se avansează momentul următoarei repetări. O valoare mai mare duce la o repetare mai devreme. Recomandat: 1.",
    SettingTextWaitting: "Timeout de Așteptare",
    SettingTextWaittingDesc: "Timeout-ul de așteptare servește două scopuri: 1) În timpul perioadei de așteptare, te obligă să petreci timp cu repetarea, meditarea și memorarea. 2) Mai important, te ajută să distingi opțiunile mai precis. Vei observa că atunci când ai o idee despre răspuns, dacă alegi opțiunea greșită, timpul de penalizare devine mai lung. Prin urmare, este mai probabil să alegi opțiunea potrivită în loc să ghicești aleatoriu răspunsul, deoarece această ghicire este foarte imprecisă. De exemplu, când nu ești sigur despre răspuns, este mai bine să alegi opțiunea 'Nu sunt sigur'. În caz contrar, dacă alegi opțiunea 'Știu', dar răspunsul este greșit, timeout-ul va fi lung. Poți ajusta această opțiune în funcție de situația ta personală pentru a prelungi sau scurta durata timeout-ului de așteptare, sau poți dezactiva complet această funcționalitate. Valorile recomandate pentru timeout-ul de așteptare ar trebui să fie numărul de secunde necesar pentru a-ți aminti un cuvânt de șase litere în decurs de trei ore fără să-l uiți."
}

// 捷克语
const csTranslation = {
    // Počáteční rozhraní
    StartTextLearn: "Posílit učení",
    StartTextNew: "Nový obsah",
    StartTextReview: "Opakování",
    StartTextEmpty: "Skvělá práce, dokončil(a) jsi všechna opakování! Teď je čas utvrdit si tyto znalosti. Tvůj další opakovací cyklus bude brzy dostupný. Do té doby se neváhej přidat další karty a pokračovat ve svém učení.",
    // Rozhraní karty - Fáze jedna: Stupeň zapamatování
    ButtonTextForget: "Zapomněl(a) jsem", // Zapomněl(a) jsem
    ButtonNotSure: "Nejsem si jistý/jistá", // Nejsem si jistý/jistá
    ButtonTextKnown: "Vím to", // Vím to
    // Rozhraní karty - Fáze dvě: Správné nebo špatné
    ButtonTextForget2: "Chápu to", // Zapomněl(a) jsem, ale teď to chápu
    ButtonTextHard: "Obtížné", // Trochu obtížné
    ButtonTextFair: "Dobré", // Dobré
    ButtonTextEasy: "Snadné", // Snadné
    ButtonTextWrong: "Špatně si vzpomínám", // Špatně si vzpomínám
    // Oblast tlačítek
    ButtonTextSkip: "Přeskočit", // Přeskočit na další
    ButtonTextOpenFile: "Otevřít soubor", // Otevřít umístění souboru
    ButtonTextOpenLast: "Otevřít poslední", // Otevřít umístění předchozího souboru
    ClipTextEase: "Snadnost vybavování", // Snadnost vybavování, vyšší hodnota znamená snazší
    // Konfigurační soubor
    SettingTextAosrSettings: "Nastavení Aosr",
    SettingTextInitEase: "Počáteční snadnost",
    SettingTextInitEaseDesc: "Základní frekvence opakování. Interval opakování se vypočítá jako (tato hodnota/100) * čas od posledního opakování. Menší číslo znamená vyšší frekvenci opakování. Doporučeno: 250.",
    SettingTextEasyChoice: "Bonus za snadnou volbu",
    SettingTextEaseChoiceDesc: "Když vybereš snadnou volbu, příští čas opakování se odkládá. Vyšší hodnota znamená delší prodlevu pro další opakování. Doporučeno: 1.",
    SettingTextHardChoice: "Bonus za obtížnou volbu",
    SettingTextHardChoiceDesc: "Když vybereš obtížnou volbu, příští čas opakování se posouvá dopředu. Vyšší hodnota znamená dřívější další opakování. Doporučeno: 1.",
    SettingTextWaitting: "Základní čas čekání",
    SettingTextWaittingDesc: "Časový limit čekání slouží k dvěma účelům: 1) Během čekací doby tě donutí věnovat čas opakování, přemýšlení a zapamatování. 2) Důležitější je, že ti pomáhá přesněji rozlišit volby. Zjistíš, že když máš nějakou představu o odpovědi a vybereš špatnou možnost, doba penalizace se prodlouží. Proto je pravděpodobnější, že vybereš vhodnou možnost namísto náhodného hádání odpovědi, protože takové hádání je velmi nepřesné. Například, když si neníš jistý/jistá odpovědí, je nejlepší vybrat možnost 'Nejsem si jistý/jistá'. Jinak, pokud vybereš možnost 'Vím to', ale odpověď je špatná, čekací doba bude dlouhá. Můžeš tuto možnost upravit podle své situace a prodloužit nebo zkrátit dobu čekání, nebo ji úplně vypnout. Doporučené hodnoty pro časový limit čekání by měly být počet sekund potřebných k zapamatování šestipísmenného slova během tří hodin, aniž bys ho zapomněl(a)."
}

// 挪威
const noTranslation = {
    // Startgrensesnitt
    StartTextLearn: "Styrk læringen",
    StartTextNew: "Nytt innhold",
    StartTextReview: "Gjennomgang",
    StartTextEmpty: "Godt jobbet! Du har fullført alle gjennomgangene dine. Nå er det på tide å la denne kunnskapen synke inn. Din neste gjennomgangssyklus vil være tilgjengelig snart. I mellomtiden kan du legge til flere kort for å fortsette læringen.",
    // Kortgrensesnitt - Trinn én: Grad av husking
    ButtonTextForget: "Glemt", // Glemt
    ButtonNotSure: "Usikker", // Usikker
    ButtonTextKnown: "Jeg vet", // Jeg vet
    // Kortgrensesnitt - Trinn to: Riktig eller galt
    ButtonTextForget2: "Skjønner", // Glemt, men nå skjønner jeg
    ButtonTextHard: "Vanskelig", // Litt vanskelig
    ButtonTextFair: "Greit", // Greit
    ButtonTextEasy: "Lett", // Lett
    ButtonTextWrong: "Husket feil", // Husket feil
    // Knappområde
    ButtonTextSkip: "Hopp over", // Hopp til neste
    ButtonTextOpenFile: "Åpne fil", // Åpne filplasseringen
    ButtonTextOpenLast: "Åpne forrige", // Åpne filplasseringen til forrige
    ClipTextEase: "Huskevanskelighet", // Huskevanskelighet, høyere verdi indikerer lettere
    // Konfigurasjonsfil
    SettingTextAosrSettings: "Aosr-innstillinger",
    SettingTextInitEase: "Startvanskelighet",
    SettingTextInitEaseDesc: "Grunnlinjen for repetisjonsfrekvensen. Repetisjonsintervallet beregnes som (denne verdien/100) * tid siden forrige repetisjon. En mindre verdi resulterer i en høyere repetisjonsfrekvens. Anbefalt: 250.",
    SettingTextEasyChoice: "Bonus for enkel valgmulighet",
    SettingTextEaseChoiceDesc: "Når du velger en enkel alternativ, utsettes neste repetisjonstidspunkt. En høyere verdi fører til lengre forsinkelse for neste repetisjon. Anbefalt: 1.",
    SettingTextHardChoice: "Bonus for vanskelig valgmulighet",
    SettingTextHardChoiceDesc: "Når du velger en vanskelig alternativ, fremskyndes neste repetisjonstidspunkt. En høyere verdi resulterer i tidligere neste repetisjon. Anbefalt: 1.",
    SettingTextWaitting: "Ventetidsgrense",
    SettingTextWaittingDesc: "Ventetiden har to formål: 1) I løpet av ventetiden tvinger den deg til å bruke tid på repetisjon, refleksjon og hukommelse. 2) Viktigere er at den hjelper deg med å skille alternativer mer nøyaktig. Du vil oppdage at når du har en idé om svaret, hvis du velger feil alternativ, blir straffetiden lengre. Derfor er det mer sannsynlig at du velger det riktige alternativet i stedet for å gjette tilfeldig, siden denne gjetningen er svært unøyaktig. For eksempel, når du er usikker på svaret, er det best å velge alternativet 'Usikker'. Hvis du derimot velger alternativet 'Jeg vet', men svaret er feil, blir ventetiden lang. Du kan justere denne innstillingen basert på din egen situasjon for å forlenge eller forkorte varigheten av ventetiden, eller du kan deaktivere den helt. Anbefalte verdier for ventetidsgrensen bør være antall sekunder det tar for deg å huske et seks bokstavers ord innen tre timer uten å glemme det."
}

const plTranslation = {
    // Interfejs początkowy
    StartTextLearn: "Wzmacnianie nauki",
    StartTextNew: "Nowa zawartość",
    StartTextReview: "Powtórka",
    StartTextEmpty: "Świetna robota! Ukończyłeś(aś) wszystkie powtórki. Teraz nadszedł czas, aby przyswoić sobie tę wiedzę. Twój kolejny cykl powtórek będzie dostępny wkrótce. W międzyczasie możesz dodać więcej kartek, aby kontynuować naukę.",
    // Interfejs karty - Etap pierwszy: Stopień zapamiętywania
    ButtonTextForget: "Zapomniałem(am)", // Zapomniałem(am)
    ButtonNotSure: "Nie jestem pewien(a)", // Nie jestem pewien(a)
    ButtonTextKnown: "Wiem", // Wiem
    // Interfejs karty - Etap drugi: Poprawnie czy źle
    ButtonTextForget2: "Rozumiem", // Zapomniałem(am), ale teraz rozumiem
    ButtonTextHard: "Trudne", // Trochę trudne
    ButtonTextFair: "Dobrze", // Dobrze
    ButtonTextEasy: "Łatwe", // Łatwe
    ButtonTextWrong: "Zapamiętałem(am) źle", // Zapamiętałem(am) źle
    // Obszar przycisków
    ButtonTextSkip: "Pomiń", // Przejdź do następnego
    ButtonTextOpenFile: "Otwórz plik", // Otwórz lokalizację pliku
    ButtonTextOpenLast: "Otwórz ostatni", // Otwórz lokalizację poprzedniego pliku
    ClipTextEase: "Łatwość przypominania", // Łatwość przypominania, wyższa wartość oznacza łatwiejsze
    // Plik konfiguracyjny
    SettingTextAosrSettings: "Ustawienia Aosr",
    SettingTextInitEase: "Początkowa łatwość",
    SettingTextInitEaseDesc: "Podstawowa częstotliwość powtórek. Interwał powtórki jest obliczany jako (ta wartość/100) * czas od ostatniej powtórki. Mniejsza wartość oznacza wyższą częstotliwość powtórek. Rekomendowane: 250.",
    SettingTextEasyChoice: "Premia za łatwy wybór",
    SettingTextEaseChoiceDesc: "Gdy wybierasz łatwą opcję, odwleka się czas następnej powtórki. Wyższa wartość oznacza dłuższe opóźnienie dla następnej powtórki. Rekomendowane: 1.",
    SettingTextHardChoice: "Premia za trudny wybór",
    SettingTextHardChoiceDesc: "Gdy wybierasz trudną opcję, przyspiesza się czas następnej powtórki. Wyższa wartość oznacza wcześniejszą powtórkę. Rekomendowane: 1.",
    SettingTextWaitting: "Limit czasu oczekiwania",
    SettingTextWaittingDesc: "Limit czasu oczekiwania pełni dwie funkcje: 1) W czasie oczekiwania zmusza cię do poświęcenia czasu na powtórkę, zastanowienie się i zapamiętanie. 2) Co ważniejsze, pomaga w dokładniejszym rozróżnianiu opcji. Zauważysz, że gdy masz jakąś wizję odpowiedzi, jeśli wybierzesz niewłaściwą opcję, czas kary staje się dłuższy. Dlatego bardziej prawdopodobne jest, że wybierzesz właściwą opcję zamiast losowego zgadywania odpowiedzi, ponieważ takie zgadywanie jest bardzo niedokładne. Na przykład, gdy nie jesteś pewien(a) odpowiedzi, najlepiej wybrać opcję 'Nie jestem pewien(a)'. Jeśli wybierzesz opcję 'Wiem', ale odpowiedź jest błędna, czas oczekiwania będzie długi. Możesz dostosować tę opcję do swojej sytuacji, aby wydłużyć lub skrócić czas oczekiwania, lub całkowicie ją wyłączyć. Zalecane wartości dla limitu czasu oczekiwania powinny być liczba sekund potrzebna do zapamiętania sześcioliterowego słowa w ciągu trzech godzin, bez zapominania go."
}

const daTranslation = {
    // Startgrænseflade
    StartTextLearn: "Styrk læring",
    StartTextNew: "Nyt indhold",
    StartTextReview: "Gennemgang",
    StartTextEmpty: "Godt klaret! Du har gennemført alle dine gennemgange. Nu er det tid til at lade denne viden synke ind. Din næste gennemgangscyklus vil være tilgængelig snart. Indtil da er du velkommen til at tilføje flere kort for at fortsætte din læring.",
    // Kortgrænseflade - Trin ét: Grad af huskning
    ButtonTextForget: "Glemt", // Glemt
    ButtonNotSure: "Ikke sikker", // Ikke sikker
    ButtonTextKnown: "Jeg ved det", // Jeg ved det
    // Kortgrænseflade - Trin to: Rigtigt eller forkert
    ButtonTextForget2: "Forstået", // Glemt, men nu forstår jeg det
    ButtonTextHard: "Svært", // Lidt svært
    ButtonTextFair: "Godt", // Godt
    ButtonTextEasy: "Let", // Let
    ButtonTextWrong: "Husket forkert", // Husket forkert
    // Knapeområde
    ButtonTextSkip: "Spring over", // Spring til næste
    ButtonTextOpenFile: "Åbn fil", // Åbn filplaceringen
    ButtonTextOpenLast: "Åbn sidste", // Åbn filplaceringen for den forrige
    ClipTextEase: "Let at huske", // Let at huske, højere værdi indikerer lettere
    // Konfigurationsfil
    SettingTextAosrSettings: "Aosr-indstillinger",
    SettingTextInitEase: "Begyndelsesnemhed",
    SettingTextInitEaseDesc: "Grundlinjen for gentagelsesfrekvensen. Gentagelsesintervallet beregnes som (denne værdi/100) * tid siden sidste gentagelse. Et mindre tal resulterer i en højere gentagelsesfrekvens. Anbefalet: 250.",
    SettingTextEasyChoice: "Bonus for let valgmulighed",
    SettingTextEaseChoiceDesc: "Når du vælger en let mulighed, udskydes tidspunktet for næste gentagelse. En højere værdi fører til længere forsinkelse for næste gentagelse. Anbefalet: 1.",
    SettingTextHardChoice: "Bonus for svær valgmulighed",
    SettingTextHardChoiceDesc: "Når du vælger en svær mulighed, fremskyndes tidspunktet for næste gentagelse. En højere værdi resulterer i en tidligere gentagelse. Anbefalet: 1.",
    SettingTextWaitting: "Ventetidsgrænse",
    SettingTextWaittingDesc: "Ventetidsgrænsen har to formål: 1) I løbet af ventetiden tvinger den dig til at bruge tid på at gentage, reflektere og huske. 2) Endnu vigtigere hjælper den dig med at skelne muligheder mere præcist. Du vil opdage, at når du har en idé om svaret, hvis du vælger den forkerte mulighed, bliver straffetiden længere. Derfor er det mere sandsynligt, at du vælger den passende mulighed i stedet for at gætte tilfældigt, da denne gætning er meget unøjagtig. For eksempel, når du er usikker på svaret, er det bedst at vælge muligheden 'Ikke sikker'. Hvis du derimod vælger muligheden 'Jeg ved det', men svaret er forkert, bliver ventetiden lang. Du kan justere denne indstilling baseret på din egen situation for at forlænge eller forkorte ventetidens varighed, eller du kan deaktivere det helt. Anbefalede værdier for ventetidsgrænsen bør være antallet af sekunder, der tager dig at huske et seks-bogstavsord inden for tre timer uden at glemme det."
}

const ukTranslation = {
    // Початковий інтерфейс
    StartTextLearn: "Посилити навчання",
    StartTextNew: "Новий вміст",
    StartTextReview: "Повторення",
    StartTextEmpty: "Відмінно! Ви завершили всі повторення. Зараз час дати цим знанням осісти у вас. Ваш наступний цикл повторень буде доступний найближчим часом. До того часу ви можете додавати ще картки, щоб продовжити навчання.",
    // Інтерфейс карти - Етап перший: Ступінь запам'ятовування
    ButtonTextForget: "Забув", // Забув
    ButtonNotSure: "Не впевнений", // Не впевнений
    ButtonTextKnown: "Я знаю", // Я знаю
    // Інтерфейс карти - Етап другий: Правильно чи неправильно
    ButtonTextForget2: "Зрозуміло", // Забув, але тепер я зрозумів
    ButtonTextHard: "Важко", // Трохи важко
    ButtonTextFair: "Добре", // Добре
    ButtonTextEasy: "Легко", // Легко
    ButtonTextWrong: "Запам'ятав неправильно", // Запам'ятав неправильно
    // Область кнопок
    ButtonTextSkip: "Пропустити", // Пропустити наступне
    ButtonTextOpenFile: "Відкрити файл", // Відкрити розташування файлу
    ButtonTextOpenLast: "Відкрити попереднє", // Відкрити розташування попереднього
    ClipTextEase: "Легкість пригадування", // Легкість пригадування, вище значення означає легше
    // Файл конфігурації
    SettingTextAosrSettings: "Налаштування Aosr",
    SettingTextInitEase: "Початкова легкість",
    SettingTextInitEaseDesc: "Базова частота повторень. Інтервал повторень обчислюється як (це значення/100) * час з моменту останнього повторення. Менше значення в результаті дає більшу частоту повторень. Рекомендовано: 250.",
    SettingTextEasyChoice: "Бонус за легкий вибір",
    SettingTextEaseChoiceDesc: "Коли вибираєте легку опцію, наступний час повторення відкладається. Вище значення призводить до більшої затримки для наступного повторення. Рекомендовано: 1.",
    SettingTextHardChoice: "Бонус за важкий вибір",
    SettingTextHardChoiceDesc: "Коли вибираєте важку опцію, наступний час повторення прискорюється. Вище значення в результаті дає раніше наступне повторення. Рекомендовано: 1.",
    SettingTextWaitting: "Межа очікування",
    SettingTextWaittingDesc: "Межа очікування має дві цілі: 1) Протягом періоду очікування вона змушує вас проводити час на повторення, роздуми та запам'ятовування. 2) Ще важливіше, вона допомагає вам точніше розрізняти варіанти. Ви помітите, що коли у вас є якась ідея щодо відповіді, якщо ви оберете неправильний варіант, час покарання стає довшим. Тому ймовірніше, що ви оберете відповідний варіант, а не випадково вгадуватимете запитання, оскільки це вгадування є дуже неточним. Наприклад, коли ви не впевнені в відповіді, найкраще обрати опцію 'Не впевнений'. Якщо ж ви оберете опцію 'Я знаю', але відповідь неправильна, час очікування буде тривалим. Ви можете налаштувати цю опцію відповідно до своєї ситуації для подовження або скорочення тривалості межі очікування, або повністю вимкнути її. Рекомендовані значення для межі очікування повинні бути кількістю секунд, необхідних для запам'ятовування слова з шести літер протягом трьох годин без забуття."
}

const sqTranslation = {
    // Interface fillestare
    StartTextLearn: "Streho mësimin",
    StartTextNew: "Përmbajtje e re",
    StartTextReview: "Ripërsërit",
    StartTextEmpty: "Punë e shkëlqyer! Ke përfunduar të gjitha ripërsëritjet! Tani është koha të lejosh që kjo dije të thellohet. Cikli i ardhshëm i ripërsëritjes do të jetë në dispozicion së shpejti. Në mes kohës, lirshëm shto më shumë kartela për të vazhduar mësimin tënd.",
    // Faqja e kartelës - Hapi i parë: Gradë e kujtesës
    ButtonTextForget: "E kam harruar", // E kam harruar
    ButtonNotSure: "Nuk jam i sigurt", // Nuk jam i sigurt
    ButtonTextKnown: "Unë e di", // Unë e di
    // Faqja e kartelës - Hapi i dytë: E saktë ose e gabuar
    ButtonTextForget2: "E kuptova", // E kam harruar, por tani e kuptova
    ButtonTextHard: "E vështirë", // Pak e vështirë
    ButtonTextFair: "Mirë", // Mirë
    ButtonTextEasy: "E lehtë", // E lehtë
    ButtonTextWrong: "Kam kujtuar gabim", // Kam kujtuar gabim
    // Zona e butonit
    ButtonTextSkip: "Kalo", // Kalo në tjetrën
    ButtonTextOpenFile: "Hap skedarin", // Hap vendndodhjen e skedarit
    ButtonTextOpenLast: "Hap më të fundit", // Hap vendndodhjen e skedarit të mëparshëm
    ClipTextEase: "Lehtësia e kujtesës", // Lehtësia e kujtesës, vlera më e lartë tregon lehtësi më të madhe
    // Skedari i konfigurimit
    SettingTextAosrSettings: "Cilësimet e Aosr-it",
    SettingTextInitEase: "Lehtësia fillestare",
    SettingTextInitEaseDesc: "Baza për frekuencën e ripërsëritjes. Intervali i ripërsëritjes llogaritet si (kjo vlerë/100) * koha që ka kaluar që nga ripërsëritja e fundit. Një numër më i vogël rezulton në një frekuencë më të lartë të ripërsëritjes. Rekomandohet: 250.",
    SettingTextEasyChoice: "Bonusi për zgjedhjen e lehtë",
    SettingTextEaseChoiceDesc: "Kur zgjedhni një opsion të lehtë, shtyhet koha për ripërsëritjen e ardhshme. Një vlerë më e madhe çon në një vonim më të gjatë për ripërsëritjen e ardhshme. Rekomandohet: 1.",
    SettingTextHardChoice: "Bonusi për zgjedhjen e vështirë",
    SettingTextHardChoiceDesc: "Kur zgjedhni një opsion të vështirë, avancon kohën për ripërsëritjen e ardhshme. Një vlerë më e madhe rezulton në një ripërsëritje më të hershme. Rekomandohet: 1.",
    SettingTextWaitting: "Kufiri i pritjes",
    SettingTextWaittingDesc: "Kufiri i pritjes ka dy qëllime: 1) Gjatë periudhës së pritjes, ju detyron të kaloni kohë duke ripërsëritur, menduar dhe kujtuar. 2) Më e rëndësishmja, ndihmon në dallimin më të saktë të opsioneve. Ju do të vini re se kur keni një ide për përgjigjen, nëse zgjidhni opsionin gabim, koha e ndëshkimit bëhet më e gjatë. Prandaj, është më e mundur që të zgjidhni opsionin përshtatshëm në vend të të vazhduarit rastësisht, pasi kjo supozim është shumë i pasaktë. Për shembull, kur nuk jeni të sigurt në përgjigje, është më mirë të zgjidhni opsionin 'Nuk jam i sigurt'. Nëse, nga ana tjetër, zgjidhni opsionin 'Unë e di', por përgjigja është e gabuar, koha e pritjes do të jetë e gjatë. Mund të rregulloni këtë opsion bazuar në situatën tuaj për të zgjatur ose për të shkurtuar kohën e kufirit të pritjes, ose mund ta çaktivizoni krejtësisht. Vlerat e rekomanduara për kufirin e pritjes duhet të jenë numri i sekondave që ju duhen për të kujtuar një fjalë me gjashtë shkronja brenda tre orëve pa e harruar atë."
}

const thTranslation = {
    // อินเทอร์เฟซเริ่มต้น
    StartTextLearn: "เสริมการเรียนรู้",
    StartTextNew: "เนื้อหาใหม่",
    StartTextReview: "ทบทวน",
    StartTextEmpty: "ดีมาก! คุณได้ทำการทบทวนทั้งหมดแล้ว ตอนนี้เป็นเวลาที่ให้ความรู้สิ่งนี้ซึ่งจะเข้าไปอยู่ในใจคุณ รอบการทบทวนถัดไปของคุณจะพร้อมใช้งานเร็ว ในระหว่างนั้นคุณสามารถเพิ่มบัตรคำเพิ่มเติมเพื่อทำให้การเรียนรู้ของคุณดำเนินไปต่อได้",
    // อินเทอร์เฟซของการ์ด - ขั้นตอนที่หนึ่ง: ระดับการจำ
    ButtonTextForget: "ลืมแล้ว", // ลืมแล้ว
    ButtonNotSure: "ไม่แน่ใจ", // ไม่แน่ใจ
    ButtonTextKnown: "ฉันรู้", // ฉันรู้
    // อินเทอร์เฟซของการ์ด - ขั้นตอนที่สอง: ถูกหรือผิด
    ButtonTextForget2: "เข้าใจแล้ว", // ลืมแล้ว แต่ตอนนี้ฉันเข้าใจแล้ว
    ButtonTextHard: "ยาก", // ค่อนข้างยาก
    ButtonTextFair: "พอดี", // พอดี
    ButtonTextEasy: "ง่าย", // ง่าย
    ButtonTextWrong: "จำผิด", // จำผิด
    // พื้นที่ปุ่ม
    ButtonTextSkip: "ข้าม", // ข้ามไปยังต่อไป
    ButtonTextOpenFile: "เปิดไฟล์", // เปิดตำแหน่งไฟล์
    ButtonTextOpenLast: "เปิดตัวก่อนหน้า", // เปิดตำแหน่งไฟล์ของก่อนหน้า
    ClipTextEase: "ความสะดวกในการจำ", // ความสะดวกในการจำ ค่าที่สูงกว่าแสดงถึงความง่าย
    // ไฟล์การกำหนดค่า
    SettingTextAosrSettings: "การตั้งค่า Aosr",
    SettingTextInitEase: "ความสะดวกเริ่มต้น",
    SettingTextInitEaseDesc: "การตั้งค่าพื้นฐานสำหรับความถี่ในการทบทวน ช่วงเวลาที่จะทบทวนคำคำนี้จะถูกคำนวณเป็น (ค่านี้/100) * เวลาตั้งแต่ครั้งที่ทบทวนล่าสุด ค่าน้อยๆ จะทำให้ทบทวนบ่อยขึ้น แนะนำ: 250",
    SettingTextEasyChoice: "โบนัสเมื่อเลือกง่าย",
    SettingTextEaseChoiceDesc: "เมื่อคุณเลือกตัวเลือกง่าย จะเลื่อนเวลาทบทวนถัดไป ค่าสูงๆ จะทำให้มีการเลื่อนเวลาทบทวนในอนาคตนานขึ้น แนะนำ: 1",
    SettingTextHardChoice: "โบนัสเมื่อเลือกยาก",
    SettingTextHardChoiceDesc: "เมื่อคุณเลือกตัวเลือกยาก จะเป็นการเร่งเวลาทบทวนถัดไป ค่าสูงๆ จะทำให้มีการเร่งเวลาทบทวนในอนาคตมากขึ้น แนะนำ: 1",
    SettingTextWaitting: "เวลาที่รอ",
    SettingTextWaittingDesc: "เวลาที่รอมีวัตถุประสงค์สองประการ: 1) ในระหว่างระยะเวลาที่รอ มันจะบังคับคุณให้ใช้เวลาในการทบทวน คิดและจำ 2) สิ่งที่สำคัญกว่าคือ มันช่วยให้คุณแยกแยะตัวเลือกได้อย่างแม่นยำมากขึ้น คุณจะพบว่าเมื่อคุณมีความคิดเกี่ยวกับคำตอบบางอย่าง ถ้าคุณเลือกตัวเลือกผิด ระยะเวลาโทษจะยาวขึ้น ดังนั้น คุณมีโอกาสที่จะเลือกตัวเลือกที่เหมาะสมมากกว่าที่จะทายอย่างสุ่มเพื่อตอบคำถาม เช่น เมื่อคุณไม่แน่ใจในคำตอบ คุณควรเลือกตัวเลือก 'ไม่แน่ใจ' แทน มิฉะนั้น ถ้าคุณเลือกตัวเลือก 'ฉันรู้' แต่คำตอบผิด ระยะเวลาที่รอจะยาวมาก คุณสามารถปรับแต่งตัวเลือกนี้ตามสถานการณ์ของคุณเพื่อเพิ่มหรือลดระยะเวลาที่รอ หรือสามารถปิดใช้งานได้ทั้งหมด ค่าที่แนะนำสำหรับเวลาที่รอควรเป็นจำนวนวินาทีที่ใช้ในการจำคำศัพท์ที่มีหกตัวอักษรในระยะเวลาสามชั่วโมงโดยไม่ลืม"
}

const faTranslation = {
    // رابط اولیه
    StartTextLearn: "تقویت یادگیری",
    StartTextNew: "محتوای جدید",
    StartTextReview: "بازبینی",
    StartTextEmpty: "عالی! شما تمام بازبینی‌ها را به پایان رسانده‌اید. حالا زمان آن است که این دانش در ذهن شما جا بیفتد. چرخه بازبینی بعدی شما به زودی در دسترس خواهد بود. تا آن زمان، می‌توانید کارت‌های بیشتری اضافه کنید تا فرایند یادگیری خود را ادامه دهید.",
    // صفحه کارت - مرحله اول: درجه حافظه
    ButtonTextForget: "فراموش کردم", // فراموش کردم
    ButtonNotSure: "مطمئن نیستم", // مطمئن نیستم
    ButtonTextKnown: "می‌دانم", // می‌دانم
    // صفحه کارت - مرحله دوم: صحیح یا غلط
    ButtonTextForget2: "فهمیدم", // فراموش کردم، اما حالا فهمیدم
    ButtonTextHard: "سخت", // کمی سخت است
    ButtonTextFair: "مناسب", // مناسب است
    ButtonTextEasy: "آسان", // آسان است
    ButtonTextWrong: "اشتباه یادآوری کردم", // اشتباه یادآوری کردم
    // منطقه دکمه‌ها
    ButtonTextSkip: "رد کردن", // رد کردن به بعدی
    ButtonTextOpenFile: "باز کردن فایل", // باز کردن مکان فایل
    ButtonTextOpenLast: "باز کردن قبلی", // باز کردن مکان فایل قبلی
    ClipTextEase: "سهولت یادآوری", // سهولت یادآوری، مقدار بالاتر به معنای آسان‌تر است
    // فایل پیکربندی
    SettingTextAosrSettings: "تنظیمات Aosr",
    SettingTextInitEase: "سهولت اولیه",
    SettingTextInitEaseDesc: "پایه برای فرکانس بازبینی. بازه بازبینی براساس این فرمول محاسبه می‌شود: (این مقدار/100) × زمان از بازبینی آخر. عدد کمتر منجر به فرکانس بازبینی بیشتر می‌شود. توصیه می‌شود: 250",
    SettingTextEasyChoice: "پاداش انتخاب آسان",
    SettingTextEaseChoiceDesc: "زمان بازبینی بعدی تأخیر می‌کند هنگامی که شما یک گزینه آسان انتخاب می‌کنید. مقدار بالا منجر به تأخیر بیشتر برای بازبینی بعدی می‌شود. توصیه می‌شود: 1",
    SettingTextHardChoice: "پاداش انتخاب سخت",
    SettingTextHardChoiceDesc: "زمان بازبینی بعدی تسریع می‌شود هنگامی که شما یک گزینه سخت انتخاب می‌کنید. مقدار بالا منجر به بازبینی زودتر می‌شود. توصیه می‌شود: 1",
    SettingTextWaitting: "محدودیت انتظار",
    SettingTextWaittingDesc: "محدودیت انتظار دو هدف دارد: 1) در طول دوره انتظار، شما را مجبور به صرف زمان برای بازبینی، تأمل و یادآوری می‌کند. 2) بیشترین اهمیت آن این است که به شما در تفکیک بهتر گزینه‌ها کمک می‌کند. شما متوجه خواهید شد که وقتی نسبت به پاسخی ایده‌ای دارید، اگر گزینه نادرست را انتخاب کنید، زمان مجازات بیشتر می‌شود. بنابراین، احتمال انتخاب گزینه مناسب به جای حدس زدن تصادفی سوال بسیار بیشتر است، زیرا این حدس زدن بسیار نادقیق است. به عنوان مثال، وقتی شما نسبت به پاسخ مطمئن نیستید، بهتر است گزینه 'مطمئن نیستم' را انتخاب کنید. در غیر این صورت، اگر شما گزینه 'می‌دانم' را انتخاب کنید و پاسخ اشتباه است، زمان انتظار طولانی خواهد بود. شما می‌توانید این گزینه را بر اساس وضعیت خود تنظیم کنید تا مدت زمان محدودیت انتظار را افزایش یا کاهش دهید یا به طور کامل غیرفعال کنید. مقادیر توصیه شده برای محدودیت انتظار باید زمانی که شما برای یادآوری یک کلمه شش حرفی در مدت سه ساعت بدون فراموشی نیاز دارید را در ثانیه نشان دهد."
}

const trTranslation = {
    // İlk Arayüz
    StartTextLearn: "Öğrenmeyi Pekiştir",
    StartTextNew: "Yeni İçerik",
    StartTextReview: "Tekrar",
    StartTextEmpty: "Harika iş! Tüm tekrarlarını tamamladın! Şimdi bu bilginin yerleşmesi için zamanı geldi. Bir sonraki tekrar döngün yakında kullanılabilir olacak. Bu arada öğrenmeye devam etmek için daha fazla kart eklemekten çekinme.",
    // Kart Arayüzü - Aşama Bir: Ezber Derecesi
    ButtonTextForget: "Unuttum", // Unuttum
    ButtonNotSure: "Emin Değilim", // Emin değilim
    ButtonTextKnown: "Biliyorum", // Biliyorum
    // Kart Arayüzü - Aşama İki: Doğru veya Yanlış
    ButtonTextForget2: "Anladım", // Unuttum, ama şimdi anladım
    ButtonTextHard: "Zor", // Biraz zor
    ButtonTextFair: "İyi", // İyi
    ButtonTextEasy: "Kolay", // Kolay
    ButtonTextWrong: "Yanlış Hatırladım", // Yanlış hatırladım
    // Düğme Alanı
    ButtonTextSkip: "Atla", // Sonrakiye atla
    ButtonTextOpenFile: "Dosyayı Aç", // Dosya konumunu aç
    ButtonTextOpenLast: "Öncekini Aç", // Önceki konumunu aç
    ClipTextEase: "Hatırlama Kolaylığı", // Hatırlama kolaylığı, daha yüksek değer daha kolay olduğunu gösterir
    // Yapılandırma Dosyası
    SettingTextAosrSettings: "Aosr Ayarları",
    SettingTextInitEase: "Başlangıç Kolaylığı",
    SettingTextInitEaseDesc: "Tekrar sıklığı için temel. Tekrar aralığı şu şekilde hesaplanır: (bu değer/100) * son tekrardan bu yana geçen süre. Daha küçük bir sayı daha yüksek bir tekrar sıklığına yol açar. Önerilen: 250.",
    SettingTextEasyChoice: "Kolay Seçenek Bonusu",
    SettingTextEaseChoiceDesc: "Kolay bir seçenek seçtiğinizde, bir sonraki tekrar zamanını erteleyecektir. Daha büyük bir değer, bir sonraki tekrar için daha uzun bir gecikme anlamına gelir. Önerilen: 1.",
    SettingTextHardChoice: "Zor Seçenek Bonusu",
    SettingTextHardChoiceDesc: "Zor bir seçenek seçtiğinizde, bir sonraki tekrar zamanını öne çekecektir. Daha büyük bir değer, daha erken bir sonraki tekrara yol açar. Önerilen: 1.",
    SettingTextWaitting: "Bekleme Süresi Temeli",
    SettingTextWaittingDesc: "Bekleme süresi iki amaçla hizmet eder: 1) Bekleme süresi boyunca tekrar yapmak, düşünmek ve hatırlamak için zaman harcamanızı zorunlu kılar. 2) Daha da önemlisi, seçenekleri daha doğru bir şekilde ayırt etmenize yardımcı olur. Cevap hakkında bir fikriniz olduğunda, yanlış seçeneği seçerseniz ceza süresi daha uzun olur. Bu nedenle, soruyu rastgele tahmin etmek yerine uygun seçeneği seçme olasılığınız daha yüksek olur. Örneğin, cevaptan emin değilseniz, 'Emin Değilim' seçeneğini seçmek en iyisidir. Aksi takdirde, 'Biliyorum' seçeneğini seçerseniz ve cevap yanlışsa, bekleme süresi uzun olacaktır. Bu seçeneği kendi durumunuza göre ayarlayarak bekleme süresinin süresini uzatabilir veya kısaltabilirsiniz veya tamamen devre dışı bırakabilirsiniz. Önerilen bekleme süresi için değer, 3 saat içinde altı harfli bir kelimeyi hatırlamak için kaç saniye sürdüğünüzdür."
}

const nlTranslation = {
    // Initiële interface
    StartTextLearn: "Leer versterken",
    StartTextNew: "Nieuwe inhoud",
    StartTextReview: "Herziening",
    StartTextEmpty: "Goed gedaan! Je hebt alle herzieningen voltooid! Nu is het tijd om deze kennis te laten bezinken. Je volgende herzieningscyclus zal binnenkort beschikbaar zijn. Ondertussen kun je meer kaarten toevoegen om je leerproces voort te zetten.",
    // Kaartinterface - Fase één: Mate van Memoriseren
    ButtonTextForget: "Vergeten", // Vergeten
    ButtonNotSure: "Niet zeker", // Niet zeker
    ButtonTextKnown: "Ik weet het", // Ik weet het
    // Kaartinterface - Fase twee: Goed of Fout
    ButtonTextForget2: "Snap het nu", // Vergeten, maar nu snap ik het
    ButtonTextHard: "Moeilijk", // Beetje moeilijk
    ButtonTextFair: "Prima", // Prima
    ButtonTextEasy: "Makkelijk", // Makkelijk
    ButtonTextWrong: "Verkeerd onthouden", // Verkeerd onthouden
    // Knopgebied
    ButtonTextSkip: "Overslaan", // Naar de volgende gaan
    ButtonTextOpenFile: "Bestand openen", // Locatie van het bestand openen
    ButtonTextOpenLast: "Vorige openen", // Locatie van de vorige openen
    ClipTextEase: "Gemak van Herinnering", // Gemak van herinnering, hogere waarde geeft aan dat het makkelijker is
    // Configuratiebestand
    SettingTextAosrSettings: "Aosr-instellingen",
    SettingTextInitEase: "Initiële Gemak",
    SettingTextInitEaseDesc: "De basislijn voor de herhalingsfrequentie. Het herhalingsinterval wordt berekend als (deze waarde/100) * tijd sinds de laatste herziening. Een kleinere waarde resulteert in een hogere herhalingsfrequentie. Aanbevolen: 250.",
    SettingTextEasyChoice: "Bonus voor Makkelijke Keuze",
    SettingTextEaseChoiceDesc: "Wanneer je een makkelijke optie kiest, wordt de volgende herziening uitgesteld. Een grotere waarde zorgt voor een langere vertraging tot de volgende herziening. Aanbevolen: 1.",
    SettingTextHardChoice: "Bonus voor Moeilijke Keuze",
    SettingTextHardChoiceDesc: "Wanneer je een moeilijke optie kiest, wordt de volgende herziening vervroegd. Een grotere waarde resulteert in een eerdere volgende herziening. Aanbevolen: 1.",
    SettingTextWaitting: "Wachttijd-basiskader",
    SettingTextWaittingDesc: "De wachttijd heeft twee doelen: 1) Tijdens de wachttijd word je gedwongen om tijd te besteden aan herziening, overdenking en memorisatie. 2) Belangrijker nog, het helpt je om opties nauwkeuriger te onderscheiden. Je zult merken dat wanneer je een idee hebt over het antwoord, als je de verkeerde optie kiest, de straftijd langer wordt. Daarom is de kans groter dat je de juiste optie kiest in plaats van willekeurig te raden bij de vraag, omdat dit raden zeer onnauwkeurig is. Bijvoorbeeld, als je twijfelt over het antwoord, is het het beste om de 'Niet zeker' optie te kiezen. Anders, als je de 'Ik weet het' optie kiest, maar het antwoord is fout, zal de wachttijd lang zijn. Je kunt deze optie aanpassen op basis van je eigen situatie om de duur van de wachttijd te verlengen of te verkorten, of je kunt deze volledig uitschakelen. Aanbevolen waarden voor de wachttijd moeten het aantal seconden zijn dat je nodig hebt om een zesletterwoord binnen drie uur te onthouden zonder het te vergeten."
}

const amTranslation = {
    // የመጀመሪያ ድርጅት
    StartTextLearn: "መማሪያን አቀርባለሁ",
    StartTextNew: "አዲስ ይድገም",
    StartTextReview: "ድግግሞሽ",
    StartTextEmpty: "አስተያየት! ሁሉንም ድግግሞሽዎችን ተማሪዎች ቀርበህ አስቀድሞ በትንሽ አልተገለጠህም! እርስዎን የሚያሳውቁ የለም። በቀላሉ የመማሪያውን ዘመቻ በትንሽ እርስዎ ተውጣል።",
    // ካርት ድግግሞሽ - ዘመን አትርምር ያለውን
    ButtonTextForget: "ስማት", // ስማት
    ButtonNotSure: "እልል", // እልል
    ButtonTextKnown: "እየታየኝ", // እየታየኝ
    // ካርት ድግግሞሽ - ዘመን አለኝ ወይም ምንም
    ButtonTextForget2: "ተከሰስሁ", // ስማት, ያለኝ እስከሚል ተከሰስሁ
    ButtonTextHard: "ቀጣይ", // ቀጣይ
    ButtonTextFair: "ጠበቅ", // ጠበቅ
    ButtonTextEasy: "ተንቀሳቃሽ", // ተንቀሳቃሽ
    ButtonTextWrong: "ምልክት የማይተውህ", // ምልክት የማይተውህ
    // አድራሻ የድህረ ገጽ
    ButtonTextSkip: "ቀጥል", // ቀጥል ለውጥ
    ButtonTextOpenFile: "ፋይል ክፈት", // ፋይል ቦታን ክፈት
    ButtonTextOpenLast: "የመጨረሻ ፋይል ክፈት", // የመጨረሻ ፋይል ክፈት
    ClipTextEase: "የስማት በትንሽ", // የስማት በትንሽ, ከእውቅና በኋላ በከፍተኛ ነገር ተንቀሳቃሽነት ይሰጣል
    // ቅንብሮ
    SettingTextAosrSettings: "Aosr ማስተካከያዎች",
    SettingTextInitEase: "ዘመን በትንሽ",
    SettingTextInitEaseDesc: "የድግግሞሽ የትንሽ ጥንቅስ. የድግግሞሽ የተቀደሰው የምሥራች ሰዓት ተጠቃሚዎችን በተንሽ እንዳይነሳል የድግግሞሽ ጥንቅስ በመተግበር ይሰጣል. በተጠቀምነት: 250.",
    SettingTextEasyChoice: "ቀጥለኝ አማራጭ አስተዋፅዦ",
    SettingTextEaseChoiceDesc: "ከተንቀሳቃሽ አማራጩን ጥረት ተውጣል ጥሩ ጥረት በተንሽ የሚገኘውን ተጠቃሚዎችን ትኩረት፣ ጥረት በመተባበር ለውጥ ይችላሉ። በተጠቃሚዎች: 1.",
    SettingTextHardChoice: "ቀጥለኝ አማራጭ አስተዋፅዦ",
    SettingTextHardChoiceDesc: "ከቀጣይ አማራጩን ቀጥል ተውጣል ቀጥል በተንሽ የሚገኘውን ተጠቃሚዎችን ትኩረት፣ ጥረት በመተባበር ቀጣይ በመሆኑ ይችላሉ። በተጠቃሚዎች: 1.",
    SettingTextWaitting: "ጥረት የጥርስ ማስተካከያ",
    SettingTextWaittingDesc: "ጥረት ሁኔታ ሁሉንም አረፍተኛ አድራሻ የሆነ ሁሉንም ማስተካከያ ያለው ነገር ነው: 1) በጥረት ያለው ጊዜ በድግግሞሽን ጥርስ፣ የማስተካከያ ጊዜውን በድግግሞሽው ውስጥ የሚሰጥህን አድራሻን እንደሚረፍት ለማስተካከያው የሚገኘውን አስተዋፅዦ እንደሚለውን ይጠቀማል። 2) በቀላሉ በከፍተኛ አድራሻው አማራጭ አስተዋፅዦ በአለም አድራሻ ስርዓት ላይ ምስልን ማድረግ እንዳይችል። በተጠቃሚዎች የጥረት ማስተካከያዎች፣ በራስህ ምን እንደሚባል ተጠቃሚዎችን ትኩረት ለማድረግ ስለሚያውቅ ፈቃድ እንዳይሆን እንጠቀማለን።"
}

const msTranslation = {
    // Antara Muka Awal
    StartTextLearn: "Perkukuh Pembelajaran",
    StartTextNew: "Kandungan Baru",
    StartTextReview: "Semakan",
    StartTextEmpty: "Baiklah, anda telah menyelesaikan semua semakan! Kini, tiba masanya untuk memberi pengetahuan ini meresap. Kitar semakan seterusnya akan menjadi tersedia tidak lama lagi. Sementara itu, anda boleh menambah kad-kad lagi untuk teruskan pembelajaran anda.",
    // Antara Muka Kad - Tahap Satu: Darjah Hafalan
    ButtonTextForget: "Lupa", // Lupa
    ButtonNotSure: "Tidak Pasti", // Tidak pasti
    ButtonTextKnown: "Saya Tahu", // Saya tahu
    // Antara Muka Kad - Tahap Dua: Betul atau Salah
    ButtonTextForget2: "Faham", // Lupa, tapi kini faham
    ButtonTextHard: "Sukar", // Agak sukar
    ButtonTextFair: "Okey", // Okey
    ButtonTextEasy: "Mudah", // Mudah
    ButtonTextWrong: "Salah Ingat", // Salah ingat
    // Kawasan Butang
    ButtonTextSkip: "Langkau", // Langkau ke seterusnya
    ButtonTextOpenFile: "Buka Fail", // Buka lokasi fail
    ButtonTextOpenLast: "Buka Terakhir", // Buka lokasi fail sebelumnya
    ClipTextEase: "Kemudahan Mengingati", // Kemudahan mengingati, nilai yang lebih tinggi menunjukkan lebih mudah
    // Fail Konfigurasi
    SettingTextAosrSettings: "Tetapan Aosr",
    SettingTextInitEase: "Kemudahan Awal",
    SettingTextInitEaseDesc: "Garis panduan untuk frekuensi semakan. Selang semakan dikira sebagai (nilai ini/100) * masa sejak semakan terakhir. Nombor yang lebih kecil menghasilkan frekuensi semakan yang lebih tinggi. Disyorkan: 250.",
    SettingTextEasyChoice: "Ganjaran Pilihan Mudah",
    SettingTextEaseChoiceDesc: "Apabila anda memilih pilihan mudah, ia menangguhkan masa semakan seterusnya. Nilai yang lebih besar membawa kepada penangguhan yang lebih lama untuk semakan seterusnya. Disyorkan: 1.",
    SettingTextHardChoice: "Ganjaran Pilihan Sukar",
    SettingTextHardChoiceDesc: "Apabila anda memilih pilihan sukar, ia memajukan masa semakan seterusnya. Nilai yang lebih besar menghasilkan semakan seterusnya yang lebih awal. Disyorkan: 1.",
    SettingTextWaitting: "Asas Masa Tunggu",
    SettingTextWaittingDesc: "Masa tunggu mempunyai dua tujuan: 1) Semasa masa tunggu, ia memaksa anda untuk meluangkan masa untuk semakan, merenung, dan menghafal. 2) Lebih penting lagi, ia membantu anda membezakan pilihan dengan lebih tepat. Anda akan dapati bahawa apabila anda mempunyai beberapa idea tentang jawapan, jika anda memilih pilihan yang salah, masa hukuman anda menjadi lebih lama. Oleh itu, anda lebih cenderung untuk memilih pilihan yang sesuai daripada menebak secara rawak pada soalan, kerana tekaan ini sangat tidak tepat. Contohnya, apabila anda tidak pasti tentang jawapan, lebih baik pilih pilihan 'Tidak Pasti'. Sebaliknya, jika anda memilih pilihan 'Saya Tahu' tetapi jawapannya salah, masa tunggu akan menjadi panjang. Anda boleh mengubah pilihan ini berdasarkan situasi anda sendiri untuk memperpanjang atau memperpendek tempoh masa tunggu, atau anda boleh mematikannya sama sekali. Nilai yang disyorkan untuk masa tunggu adalah bilangan saat yang diperlukan bagi anda untuk mengingati perkataan enam huruf dalam masa tiga jam tanpa melupakannya."
}

const ptBRTranslation = {
    // 初始界面
    StartTextLearn: "Reforçar Aprendizado",
    StartTextNew: "Novo Conteúdo",
    StartTextReview: "Revisão",
    StartTextEmpty: "Ótimo trabalho! Você completou todas as revisões! Agora é hora de deixar esse conhecimento fixar. Seu próximo ciclo de revisão estará disponível em breve. Enquanto isso, sinta-se à vontade para adicionar mais cartões para continuar seu aprendizado.",
    // Interface do Cartão - Etapa Um: Grau de Memorização
    ButtonTextForget: "Esqueci", // Esqueci
    ButtonNotSure: "Não Tenho Certeza", // Não tenho certeza
    ButtonTextKnown: "Eu Sei", // Eu sei
    // Interface do Cartão - Etapa Dois: Correto ou Errado
    ButtonTextForget2: "Entendi", // Esqueci, mas agora entendi
    ButtonTextHard: "Difícil", // Um pouco difícil
    ButtonTextFair: "Ok", // Ok
    ButtonTextEasy: "Fácil", // Fácil
    ButtonTextWrong: "Lembrei Errado", // Lembrei errado
    // Área de Botões
    ButtonTextSkip: "Pular", // Pular para o próximo
    ButtonTextOpenFile: "Abrir Arquivo", // Abrir localização do arquivo
    ButtonTextOpenLast: "Abrir Último", // Abrir localização do arquivo do anterior
    ClipTextEase: "Facilidade de Lembrança", // Facilidade de lembrança, valor mais alto indica mais fácil
    // Arquivo de Configuração
    SettingTextAosrSettings: "Configurações do Aosr",
    SettingTextInitEase: "Facilidade Inicial",
    SettingTextInitEaseDesc: "A linha de base para a frequência de revisão. O intervalo de revisão é calculado como (esse valor/100) * tempo desde a última revisão. Um número menor resulta em uma frequência de revisão mais alta. Recomendado: 250.",
    SettingTextEasyChoice: "Bônus para Opção Fácil",
    SettingTextEaseChoiceDesc: "Quando você escolhe uma opção fácil, adia o próximo tempo de revisão. Um valor maior resulta em um atraso maior para a próxima revisão. Recomendado: 1.",
    SettingTextHardChoice: "Bônus para Opção Difícil",
    SettingTextHardChoiceDesc: "Quando você escolhe uma opção difícil, antecipa o próximo tempo de revisão. Um valor maior resulta em uma revisão anterior. Recomendado: 1.",
    SettingTextWaitting: "Tempo Limite de Espera",
    SettingTextWaittingDesc: "O tempo limite de espera tem dois propósitos: 1) Durante o período de espera, ele te obriga a dedicar tempo à revisão, contemplação e memorização. 2) Mais importante, ele ajuda você a distinguir opções com mais precisão. Você vai perceber que quando tiver alguma ideia sobre a resposta, se escolher a opção errada, seu tempo de penalidade se torna mais longo. Portanto, você tem mais probabilidade de escolher a opção apropriada em vez de adivinhar aleatoriamente a questão, já que essa adivinhação é altamente imprecisa. Por exemplo, quando você não tem certeza sobre a resposta, é melhor escolher a opção 'Não Tenho Certeza'. Caso contrário, se escolher a opção 'Eu Sei', mas a resposta estiver errada, o tempo de espera será longo. Você pode ajustar essa opção com base na sua própria situação para estender ou encurtar a duração do tempo limite de espera, ou pode desabilitá-lo completamente. Os valores recomendados para o tempo limite de espera devem ser o número de segundos necessários para você lembrar uma palavra de seis letras dentro de três horas sem esquecê-la."
}

const todayStatic = {
    "en": "Today's Learning Progress Statistics",
    "zh": "今日学习进度统计",
    "ja": "今日の学習進度統計",
    "zh-TW": "今日學習進度統計",
    "ko": "오늘의 학습 진행 상황 통계",
    "ar": "إحصائيات تقدم التعلم اليوم",
    "pt": "Estatísticas de Progresso de Aprendizado de Hoje",
    "de": "Statistiken zum Lernfortschritt von heute",
    "ru": "Статистика учебного прогресса на сегодня",
    "fr": "Statistiques d'avancement des apprentissages du jour",
    "es": "Estadísticas del Progreso de Aprendizaje de Hoy",
    "it": "Statistiche del progresso di apprendimento di oggi",
    "id": "Statistik Kemajuan Belajar Hari Ini",
    "ro": "Statisticile de progres al învățării de astăzi",
    "cs": "Dnešní statistiky učebního pokroku",
    "no": "Dagens statistikk for læringsfremgang",
    "pl": "Dzisiejsze statystyki postępów w nauce",
    "uk": "Статистика навчального прогресу на сьогодні",
    "sq": "Statistikat e Progresit të Mësimit të Sotëm",
    "th": "สถิติความคืบหน้าในการเรียนรู้วันนี้",
    "fa": "آمار پیشرفت آموزش امروز",
    "tr": "Bugünkü Öğrenme İlerleme İstatistikleri",
    "nl": "Statistieken van de leerprogressie van vandaag",
    "ms": "Statistik Kemajuan Pembelajaran Hari Ini",
    "pt-BR": "Estatísticas de Progresso de Aprendizado de Hoje",
    "am": "የዛሬ የትምህርት እርስዎ ግብር ሪፖርት",
    "da": "Dagens statistik for læringens fremgang"
}

const StartReview = {
    "en": "Start Reviewing",
    "zh": "开始复习",
    "ja": "復習を始める",
    "zh-TW": "開始複習",
    "ko": "복습 시작하기",
    "ar": "ابدأ المراجعة",
    "pt": "Iniciar Revisão",
    "de": "Mit dem Review beginnen",
    "ru": "Начать повторение",
    "fr": "Commencer la révision",
    "es": "Comenzar a revisar",
    "it": "Inizia la revisione",
    "id": "Mulai Meninjau",
    "ro": "Începeți revizuirea",
    "cs": "Začít opakování",
    "no": "Start gjennomgangen",
    "pl": "Rozpocznij powtórkę",
    "uk": "Почати повторення",
    "sq": "Fillo rishikimin",
    "th": "เริ่มการทบทวน",
    "fa": "شروع مرور",
    "tr": "İncelemeye Başla",
    "nl": "Begin met herziening",
    "ms": "Mula Menyemak Semula",
    "pt-BR": "Iniciar Revisão",
    "am": "መሰረታውን ጀምር",
    "da": "Start med at gennemgå"
}