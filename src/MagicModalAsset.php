<?php
/**
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */

namespace magicsoft\modal;

use magicsoft\base\MagicSoftModule;
use magicsoft\base\TranslationTrait;
use yii\helpers\Json;
use yii\web\AssetBundle;
use yii\web\View;

class MagicModalAsset extends AssetBundle
{
    use TranslationTrait;
    public $sourcePath = '@vendor/magicsoft/yii2-modal/src/assets';

    public $js = [
		'js/magic.modal.js',
		'js/dependencies/magic.helper.js',
		'js/dependencies/magic.message.js',
		'js/dependencies/message.js',
		'js/dependencies/spin.js',
		'js/dependencies/jquery.form.js',
		'js/dependencies/beep.js'
    ];

    public $css = [
        'css/modal.css',
    ];

    public $depends = [
        'yii\web\JqueryAsset'
    ];

    public function init()
    {
        $this->initI18N(MagicSoftModule::getSorceLangage(), 'magicmodal');

        /*$language = Json::encode([
            'confirmToLoad' => [
                'title' => \Yii::t('magicmodal', 'Confirmation to load'),
                'message' => \Yii::t('magicmodal', 'Execute this action?'),
            ],
            'confirmToSend' => [
                'title' => \Yii::t('magicmodal', 'Confirmation to send'),
                'message' => \Yii::t('magicmodal', 'Send data to server?'),
            ],
            'confirmToClose' => [
                'title' => \Yii::t('magicmodal', 'Confirmation to close'),
                'message' => \Yii::t('magicmodal', 'If you close the screen you may lose important information. <br> <br> <strong> Do you want to continue?</strong>'),
            ],
            'confirmToReload' => [
                'title' => \Yii::t('magicmodal', 'Reload this window'),
                'message' => \Yii::t('magicmodal', 'This action will return your data to the latest update. <br> <br> <strong> Recent changes will be lost.</strong>'),
            ],
            'confirmTexts' => [
                'ok' => \Yii::t('magicmodal', 'Ok'),
                'cancel' => \Yii::t('magicmodal', 'Cancel'),
            ],
        ]);*/


        $js = '
        var magicModalMessages = {
            confirmToLoad : {
                title : "' . \Yii::t('magicmodal', 'Confirmation to load') . '",
                message : "' . \Yii::t('magicmodal', 'Execute this action?') . '"
            },
            confirmToSend : {
                title : "' . \Yii::t('magicmodal', 'Confirmation to send') . '",
                message : "' . \Yii::t('magicmodal', 'Send data to server?') . '"
            },
            confirmToClose : {
                title : "' . \Yii::t('magicmodal', 'Confirmation to close') . '",
                message : "' . \Yii::t('magicmodal', 'If you close the screen you may lose important information. <br> <br> <strong> Do you want to continue?</strong>') . '"
            },
            confirmToReload : {
                title : "' . \Yii::t('magicmodal', 'Reload this window') . '",
                message : "' . \Yii::t('magicmodal', 'This action will return your data to the latest update. <br> <br> <strong> Recent changes will be lost.</strong>') . '"
            },
            confirmTexts : {
                ok : "' . \Yii::t('magicmodal', 'Ok') . '",
                cancel : "' . \Yii::t('magicmodal', 'Cancel') . '"
            },
        };';

        \Yii::$app->getView()->registerJs($js, View::POS_BEGIN);

        parent::init();
    }
}
