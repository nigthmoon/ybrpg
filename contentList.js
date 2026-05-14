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

        attack5:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为115%',//常规描述
            ai_intro:'对前排单体造成伤害，伤害系数为115%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.15);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack6:{
            name:'攻击',
            intro:'对一行敌人造成伤害，伤害系数为60%',//常规描述
            ai_intro:'对敌方前排造成伤害，伤害系数为60%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.6);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack7:{
            name:'攻击',
            intro:'对一列敌人造成伤害，伤害系数为70%',//常规描述
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.7);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack8:{
            name:'攻击',
            intro:'对一行敌人造成伤害，伤害系数为50%',//常规描述
            ai_intro:'对敌方后排造成伤害，伤害系数为50%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.5);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack9:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为105%',//常规描述
            ai_intro:'对后排单体造成伤害，伤害系数为105%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        
        attack10:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为105%',//常规描述
            ai_intro:'对前排单体造成伤害，伤害系数为105%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack11:{
            name:'攻击',
            intro:'对一列敌人造成伤害，伤害系数为65%',//常规描述
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.65);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },


        attack12:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为95%',//常规描述
            ai_intro:'对前排单体造成伤害，伤害系数为95%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.95);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack13:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为85%',//常规描述
            ai_intro:'对后排单体造成伤害，伤害系数为85%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.85);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        attack14:{
            name:'攻击',
            intro:'对单体造成伤害，伤害系数为90%',//常规描述
            ai_intro:'对前排单体造成伤害，伤害系数为90%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.9);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack15:{
            name:'攻击',
            intro:'对一列敌人造成伤害，伤害系数为55%',//常规描述
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为55%',//代表ai的倾向
            //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
            target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
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
                game.log(player, "对目标造成了伤害");
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
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill5:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为180%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为180%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.80);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        attack_skill6:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为325%',
            ai_intro:'对敌方前排单体造成伤害，伤害系数为325%',
            target:['one','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.25);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill7:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为165%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为165%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.65);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill8:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为195%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.95);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill9:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为155%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为155%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.55);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill10:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为175%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为175%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.75);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        attack_skill11:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为130%',
            ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为130%',
            target:['manual_multi','manahighest',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.3);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill12:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为335%',
            ai_intro:'对敌方血量最高单体造成伤害，伤害系数为335%',
            target:['one','highest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.35);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill13:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为305%',
            ai_intro:'对敌方前排单体造成伤害，伤害系数为305%',
            target:['one','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill14:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为150%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为150%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.5);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill15:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为140%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为140%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.40);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill16:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为180%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为180%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.8);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill17:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为205%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill18:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为145%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为145%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.45);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill19:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为265%',
            ai_intro:'对血量最少的敌方造成伤害，伤害系数为265%',
            target:['one','lowest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.65);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill20:{
            name:'技能攻击',
            intro:'对全体造成伤害，伤害系数为105%',
            ai_intro:'对全体敌方造成伤害，伤害系数为105%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.05);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        attack_skill21:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为135%',
            ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为135%',
            target:['manual_multi','manahighest',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.35);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill22:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为150%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为150%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.50);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill23:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为285%',
            ai_intro:'对敌方后排单体造成伤害，伤害系数为285%',
            target:['one','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.85);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        
        attack_skill24:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为255%',
            ai_intro:'对敌方后排单体造成伤害，伤害系数为255%',
            target:['one','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.55);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill25:{
            name:'技能攻击',
            intro:'对全体造成伤害，伤害系数为90%',
            ai_intro:'对全体敌方造成伤害，伤害系数为90%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.9);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill27:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为285%',
            ai_intro:'对敌方前排单体造成伤害，伤害系数为285%',
            target:['one','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.85);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill28:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为140%',
            ai_intro:'对敌方前排敌人造成伤害，伤害系数为140%',
            target:['row','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.40);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill29:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为170%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为170%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.7);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill30:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为135%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为135%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.35);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill31:{
            name:'技能攻击',
            intro:'对一行敌人造成伤害，伤害系数为130%',
            ai_intro:'对敌方后排敌人造成伤害，伤害系数为130%',
            target:['row','last'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.3);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill32:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为230%',
            ai_intro:'对血量最少的敌方造成伤害，伤害系数为230%',
            target:['one','lowest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.3);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill33:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为310%',
            ai_intro:'对敌方血量最高单体造成伤害，伤害系数为310%',
            target:['one','highest'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*3.1);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },

        attack_skill34:{
            name:'技能攻击',
            intro:'对单体造成伤害，伤害系数为270%',
            ai_intro:'对敌方前排单体造成伤害，伤害系数为270%',
            target:['one','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2.7);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill35:{
            name:'技能攻击',
            intro:'对全体造成伤害，伤害系数为85%',
            ai_intro:'对全体敌方造成伤害，伤害系数为85%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*0.85);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill36:{
            name:'技能攻击',
            intro:'对一列敌人造成伤害，伤害系数为160%',
            ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为160%',
            target:['column','first'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.6);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_skill37:{
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为130%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为130%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.3);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
            }
        },


        
        attack_skill38:{//主角专用的
            name:'技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为165%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为165%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.65);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
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
        },
        recover_skill2:{
            name:'技能回复',
            intro:'治疗全体友方，系数为115%',
            ai_intro:'治疗全体友方，系数为115%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1.15);
                player.rpg_recover(targets,num);
                game.log(player, "对目标进行了治疗");
            }
        },
        recover_skill3:{
            name:'技能回复',
            intro:'治疗全体友方，系数为100%',
            ai_intro:'治疗全体友方，系数为100%',
            target:['all','all'],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*1);
                player.rpg_recover(targets,num);
                game.log(player, "对目标进行了治疗");
            }
        },
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
                game.log(player, "对目标造成了伤害");
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
                game.log(player, "对目标造成了伤害");
            }
        },
        attack_spskill5:{
            name:'必杀技能攻击',
            intro:'对三名敌人造成伤害，伤害系数为200%',
            ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为200%',
            target:['manual_multi','random',3],
            content:function(event,player){
                var targets=event.targets;
                var num=Math.floor(player.atk*2);
                player.rpg_attack(targets,num);
                game.log(player, "对目标造成了伤害");
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
window.contentList=contentList;
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
// const contentList = {
//     pugong:{
//         attack1:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为125%',//常规描述
//             ai_intro:'对前排单体造成伤害，伤害系数为125%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.25);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack2:{
//             name:'攻击',
//             intro:'对一行敌人造成伤害，伤害系数为65%',//常规描述
//             ai_intro:'对敌方前排造成伤害，伤害系数为65%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.65);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack3:{
//             name:'攻击',
//             intro:'对一列敌人造成伤害，伤害系数为75%',//常规描述
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为75%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.75);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack4:{
//             name:'攻击',
//             intro:'对一行敌人造成伤害，伤害系数为55%',//常规描述
//             ai_intro:'对敌方后排造成伤害，伤害系数为55%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.55);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack5:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为115%',//常规描述
//             ai_intro:'对前排单体造成伤害，伤害系数为115%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.15);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack6:{
//             name:'攻击',
//             intro:'对一行敌人造成伤害，伤害系数为60%',//常规描述
//             ai_intro:'对敌方前排造成伤害，伤害系数为60%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['row','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.6);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack7:{
//             name:'攻击',
//             intro:'对一列敌人造成伤害，伤害系数为70%',//常规描述
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为70%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.7);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack8:{
//             name:'攻击',
//             intro:'对一行敌人造成伤害，伤害系数为50%',//常规描述
//             ai_intro:'对敌方后排造成伤害，伤害系数为50%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['row','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.5);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack9:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为105%',//常规描述
//             ai_intro:'对后排单体造成伤害，伤害系数为105%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

        
//         attack10:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为105%',//常规描述
//             ai_intro:'对前排单体造成伤害，伤害系数为105%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack11:{
//             name:'攻击',
//             intro:'对一列敌人造成伤害，伤害系数为65%',//常规描述
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为65%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.65);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },


//         attack12:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为95%',//常规描述
//             ai_intro:'对前排单体造成伤害，伤害系数为95%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.95);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack13:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为85%',//常规描述
//             ai_intro:'对后排单体造成伤害，伤害系数为85%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','last'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.85);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack14:{
//             name:'攻击',
//             intro:'对单体造成伤害，伤害系数为90%',//常规描述
//             ai_intro:'对前排单体造成伤害，伤害系数为90%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['one','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.9);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack15:{
//             name:'攻击',
//             intro:'对一列敌人造成伤害，伤害系数为55%',//常规描述
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为55%',//代表ai的倾向
//             //名词解释：伤害系数，指行动的角色的攻击力乘以伤害系数即为伤害数值，治疗系数同理
//             target:['column','first'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.55);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         recover1:{
//             name:'回复',
//             intro:'治疗我方单体，系数为1',//常规描述
//             ai_intro:'治疗我方体力最低的单体，系数为1',//代表ai的倾向
//             target:['one','lowest'],//第一个元素代表选目标模式，第二个元素ai倾向
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk);
//                 player.rpg_recover(targets,num);
//                 game.log(player, "对目标进行了治疗");
//             }
//         }
//     },
//     skill:{
//         attack_skill1:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为305%',
//             ai_intro:'对血量最少的敌方造成伤害，伤害系数为305%',
//             target:['one','lowest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill2:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为190%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为190%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.9);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill3:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为225%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为225%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.25);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill4:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为170%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为170%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.7);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill5:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为180%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为180%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.80);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack_skill6:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为325%',
//             ai_intro:'对敌方前排单体造成伤害，伤害系数为325%',
//             target:['one','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.25);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill7:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为165%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为165%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.65);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill8:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为195%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为195%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.95);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill9:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为155%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为155%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.55);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill10:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为175%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为175%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.75);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack_skill11:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为130%',
//             ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为130%',
//             target:['triple','manahighest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.3);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill12:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为335%',
//             ai_intro:'对敌方血量最高单体造成伤害，伤害系数为335%',
//             target:['one','highest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.35);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill13:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为305%',
//             ai_intro:'对敌方前排单体造成伤害，伤害系数为305%',
//             target:['one','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill14:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为150%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为150%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.5);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill15:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为140%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为140%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.40);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill16:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为180%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为180%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.8);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill17:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为205%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为205%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill18:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为145%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为145%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.45);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill19:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为265%',
//             ai_intro:'对血量最少的敌方造成伤害，伤害系数为265%',
//             target:['one','lowest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.65);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill20:{
//             name:'技能攻击',
//             intro:'对全体造成伤害，伤害系数为105%',
//             ai_intro:'对全体敌方造成伤害，伤害系数为105%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.05);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack_skill21:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为135%',
//             ai_intro:'对三名敌方能量最高的敌人造成伤害，伤害系数为135%',
//             target:['triple','manahighest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.35);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill22:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为150%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为150%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.50);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill23:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为285%',
//             ai_intro:'对敌方后排单体造成伤害，伤害系数为285%',
//             target:['one','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.85);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

        
//         attack_skill24:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为255%',
//             ai_intro:'对敌方后排单体造成伤害，伤害系数为255%',
//             target:['one','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.55);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill25:{
//             name:'技能攻击',
//             intro:'对全体造成伤害，伤害系数为90%',
//             ai_intro:'对全体敌方造成伤害，伤害系数为90%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.9);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill27:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为285%',
//             ai_intro:'对敌方前排单体造成伤害，伤害系数为285%',
//             target:['one','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.85);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill28:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为140%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为140%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.40);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill29:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为170%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为170%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.7);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill30:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为135%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为135%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.35);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill31:{
//             name:'技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为130%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为130%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.45);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill32:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为230%',
//             ai_intro:'对血量最少的敌方造成伤害，伤害系数为230%',
//             target:['one','lowest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.3);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill33:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为310%',
//             ai_intro:'对敌方血量最高单体造成伤害，伤害系数为310%',
//             target:['one','highest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.1);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },

//         attack_skill34:{
//             name:'技能攻击',
//             intro:'对单体造成伤害，伤害系数为270%',
//             ai_intro:'对敌方前排单体造成伤害，伤害系数为270%',
//             target:['one','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.7);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill35:{
//             name:'技能攻击',
//             intro:'对全体造成伤害，伤害系数为85%',
//             ai_intro:'对全体敌方造成伤害，伤害系数为85%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*0.85);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill36:{
//             name:'技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为160%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为160%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.6);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_skill37:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为130%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为130%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.3);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },


        
//         attack_skill38:{
//             name:'技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为165%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为165%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.65);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },


















//         recover_skill1:{
//             name:'技能回复',
//             intro:'治疗全体友方，系数为125%',
//             ai_intro:'治疗全体友方，系数为125%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.25);
//                 player.rpg_recover(targets,num);
//                 game.log(player, "对目标进行了治疗");
//             }
//         },
//         recover_skill2:{
//             name:'技能回复',
//             intro:'治疗全体友方，系数为115%',
//             ai_intro:'治疗全体友方，系数为115%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.15);
//                 player.rpg_recover(targets,num);
//                 game.log(player, "对目标进行了治疗");
//             }
//         },
//         recover_skill3:{
//             name:'技能回复',
//             intro:'治疗全体友方，系数为100%',
//             ai_intro:'治疗全体友方，系数为100%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1);
//                 player.rpg_recover(targets,num);
//                 game.log(player, "对目标进行了治疗");
//             }
//         },
//     },
//     spskill:{
//         attack_spskill1:{
//             name:'必杀技能攻击',
//             intro:'对单体造成伤害，伤害系数为335%',
//             ai_intro:'对血量最少的敌方造成伤害，伤害系数为335%',
//             target:['one','lowest'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*3.35);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_spskill2:{
//             name:'必杀技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为210%',
//             ai_intro:'对敌方前排敌人造成伤害，伤害系数为210%',
//             target:['row','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.1);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_spskill3:{
//             name:'必杀技能攻击',
//             intro:'对一列敌人造成伤害，伤害系数为250%',
//             ai_intro:'对敌方默认前排所在的一列敌人造成伤害，伤害系数为250%',
//             target:['column','first'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2.5);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_spskill4:{
//             name:'必杀技能攻击',
//             intro:'对一行敌人造成伤害，伤害系数为190%',
//             ai_intro:'对敌方后排敌人造成伤害，伤害系数为190%',
//             target:['row','last'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.9);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         attack_spskill5:{
//             name:'必杀技能攻击',
//             intro:'对三名敌人造成伤害，伤害系数为200%',
//             ai_intro:'对敌方随机三名敌人造成伤害，伤害系数为200%',
//             target:['triple','random'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*2);
//                 player.rpg_attack(targets,num);
//                 game.log(player, "对目标造成了伤害");
//             }
//         },
//         recover_spskill1:{
//             name:'必杀技能回复',
//             intro:'治疗全体友方，系数为150%',
//             ai_intro:'治疗全体友方，系数为150%',
//             target:['all','all'],
//             content:function(event,player){
//                 var targets=event.targets;
//                 var num=Math.floor(player.atk*1.5);
//                 player.rpg_recover(targets,num);
//                 game.log(player, "对目标进行了治疗");
//             }
//         }

//     },
// }