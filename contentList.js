//🗡️⚡🧊💧❄️☄️🔥⭐🧪🌙请使用这些作为技能特效。使用方法：
//最后一个药剂🧪为治疗特效专用，在被治疗的角色头上向下落在角色身上，然后再出治疗数字。
//🗡️为攻击一行敌人，且ai倾向为前排的专用特效，方法为从方阵最左边横穿该行，然后出伤害数字。
//🌙为攻击一行敌人，且ai倾向为后排的专用特效，方法为从方阵最左边横穿该行，然后出伤害数字。
//⚡为攻击一列敌人专用特效，从前方贯穿该列最后方，然后出伤害数字。
//🔥为攻击一名敌人专用，方法为从角色头上降落，然后出伤害数字
//其他的以后再说，先不用管
const contentList = {
    pugong:{
        attack1:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为125%',//常规描述
            ai_intro:'对前排单体造成伤害，伤害系数为125%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.25);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack2:{
            name:'攻击',
            intro:'对一行敌人造成伤害，伤害系数为65%',//常规描述
            ai_intro:'对敌方前排造成伤害，伤害系数为65%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.65);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack3:{
            name:'攻击',
            intro:'对一列敌人造成伤害，伤害系数为75%',//常规描述
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为75%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.75);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack4:{
            name:'攻击',
            intro:'对一行敌人造成伤害，伤害系数为55%',//常规描述
            ai_intro:'对敌方后排造成伤害，伤害系数为55%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.55);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        recover1:{
            name:'回复',
            intro:'治疗我方单体，系数为1',//常规描述
            ai_intro:'治疗我方体力最低的单体，系数为1',//代表ai的倾向
            target:['one','lowest'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk);
                player.rpg_recover(targets,num);
                game.log(player, "对目标进行了治疗");
            }
        }
    },
    skill:{
        attack_skill1:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为305%',
            ai_intro:'对血量最少的敌方造成伤害，伤害系数为305%',
            target:['one','lowest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill2:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为190%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为190%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.9);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill3:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为225%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为225%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.25);
                player.rpg_attack(targets,num);
            }
        },
        attack_skill4:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为170%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为170%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.7);
                player.rpg_attack(targets,num);
            }
        },
        recover_skill1:{
            name:'技能回复',
            intro:'治疗全体友方，系数为125%',
            ai_intro:'治疗全体友方，系数为125%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.25);
                player.rpg_recover(targets,num);
                game.log(player, "对目标进行了治疗");
            }
        }
    },
    spskill:{
        attack_spskill1:{
            name:'必杀技能攻击',
            intro:'对单体造成伤害，伤害系数为335%',
            ai_intro:'对血量最少的敌方造成伤害，伤害系数为335%',
            target:['one','lowest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.35);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_spskill2:{
            name:'必杀技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为210%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为210%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.1);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_spskill3:{
            name:'必杀技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为250%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为250%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.5);
                player.rpg_attack(targets,num);
            }
        },
        attack_spskill4:{
            name:'必杀技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为190%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为190%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.9);
                player.rpg_attack(targets,num);
            }
        },
        recover_spskill1:{
            name:'必杀技能回复',
            intro:'治疗全体友方，系数为150%',
            ai_intro:'治疗全体友方，系数为150%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.5);
                player.rpg_recover(targets,num);
                game.log(player, "对目标进行了治疗");
            }
        }

    },
}
/*
target元素释义
one:单个目标
all:全体目标
row:行目标
column:列目标
all:所有目标

lowest:血量最低目标
first:行/列第一个目标
last:行/列最后一个目标
random:随机目标
all:所有目标










*/