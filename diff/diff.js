const toolDiv = document.getElementById('toolDiv');
const grabDiv = document.getElementById('grabDiv');
const textMain = document.getElementById('textViewer');
const viewer = document.getElementById('viewer');
const imgs = document.querySelectorAll('.viewImg,.opacityImg');
const viewImgs = document.querySelectorAll('.viewImg');
const opImgs = document.querySelectorAll('.opacityImg');
const imgWraps = document.querySelectorAll('.imgWrap');
const imgPats=[document.getElementById('changeBt13'),
               document.getElementById('changeBt12'),
               document.getElementById('changeBt23'),
               document.getElementById('changeBt123')];
let scale=1.0,posX=0,posY=0,isDragging=false,startX=0,startY=0;rotation=0;pages=1;
const saiFlag=(json.sais).split(",");
let imgTimer,firstMergy=true,newVis=1.0,deleteVis=1.0,changeVis=1.0;
const opacityRange=document.getElementById("opacityRange");
const opacity=document.getElementById("opacity");
const panel=document.getElementById("infoPanel");
const toggle =document.getElementById("infoToggle");
/*初期読み込み*/
document.addEventListener("DOMContentLoaded",async function(){
    if(json.pages===1){
        document.getElementById('nextBt').style.display="none";
        document.getElementById('previewBt').style.display="none";
    }
    await changeImgMode();
    document.title=json.title;
    opacityRange.value=json.opacity*100;
    opacity.textContent=json.opacity*100+"%";
    const d=json.name1;
    json.name1=
        `${d[0]}${d[1]}${d[2]}${d[3]}/${d[4]}${d[5]}/${d[6]}${d[7]} ${d[9]}${d[10]}:${d[10]}${d[11]}:${d[12]}${d[13]}`;
    document.getElementById('name1').textContent=`${json.name1} - page ${pages} / ${json.pages}`;
    document.getElementById('textName1').textContent=`${json.title} - ${json.name1}`;
    const e=json.name2;
    json.name2=
        `${e[0]}${e[1]}${e[2]}${e[3]}/${e[4]}${e[5]}/${e[6]}${e[7]} ${e[9]}${e[10]}:${e[10]}${e[11]}:${e[12]}${e[13]}`;
    document.getElementById('name2').textContent=`${json.name2} - page ${pages} / ${json.pages}`;
    document.getElementById('textName2').textContent=`${json.title} - ${json.name2}`;
    document.addEventListener('keydown',async function (e) {
        if (e.code == 'Space') {
            await aoriClick();
        }else if (e.code == 'Escape') {
            if(json.text==="true"){
                json.text="false";
            }else{
                json.text="true";
            }
            await chengeIT(json.text);
        }else if (e.code == 'ArrowLeft') {
            if(json.text==="false"){
                if(pages!==1){
                    pages-=1;
                }else{
                    pages=json.pages;
                }
                await imgSet();
            }
        }else if (e.code == 'ArrowRight') {
            if(json.text==="false"){
                if(pages!==json.pages){
                    pages+=1;
                }else{
                    pages=1;
                }
                await imgSet();
            }
        };
    });
    await chengeIT(json.text);
    //ツールdivをドラッグさせるコード
    (function(){
        const elements = document.getElementById("toolDiv");
        let x;
        let y;
        elements.addEventListener("mousedown", mdown, false);
        elements.addEventListener("touchstart", mdown, false);
        function mdown(e) {
            if(e.type === "mousedown") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
            }
            x = event.pageX - this.offsetLeft;
            y = event.pageY - this.offsetTop;
            if(y<7){
                this.classList.add("drag");
                document.body.addEventListener("mousemove", mmove, false);
            }else{
                return;
            }
        }
        function mmove(e) {
            let drag = document.getElementsByClassName("drag")[0];
            if(e.type === "mousemove") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
            }
            e.preventDefault();
            drag.style.top = event.pageY - y + "px";
            drag.style.left = event.pageX - x + "px";
            drag.addEventListener("mouseup", mup, false);
            document.body.addEventListener("mouseleave", mup, false);
        }
        function mup(e) {
            let drag = document.getElementsByClassName("drag")[0];
            if(drag){
                if(parseInt(drag.style.left)<0){drag.style.left="0px"};
                if(parseInt(drag.style.top)<0){drag.style.top="0px"};
                document.body.removeEventListener("mousemove", mmove, false);
                drag.removeEventListener("mouseup", mup, false);
                drag.classList.remove("drag");
            }
        }
    })();
    opacityRange.addEventListener("input", () => {
        json.opacity=opacityRange.value/100;
        opacity.textContent=json.opacity*100+"%";
        opImgs.forEach(opa => {
            opa.style.opacity=json.opacity;
        });
    });
    toggle.addEventListener("click", () => {
        panel.classList.toggle("closed");
        if(panel.classList.contains("closed")){
            toggle.textContent = "▲";
        }else{
            toggle.textContent = "▼";
        }
    });
    document.querySelectorAll(".closeLabel")
    .forEach(btn => {
        btn.addEventListener("click", e => {
            const label=e.target.closest(".imgLabel");
            label.classList.add("hide");
        });
    });
    await timerChange();
});
//初期フィット関数
async function fitToScreen() {
    if(saiFlag[pages-1]==="true"){
        document.getElementById('name3').textContent="Difference result";
        document.getElementsByClassName('imgLabel')[2].style.backgroundColor="red";
    }else if(saiFlag[pages-1]==="false"){
        document.getElementById('name3').textContent="No difference!";
        document.getElementsByClassName('imgLabel')[2].style.backgroundColor="blue";
    }else if(saiFlag[pages-1]==="sizeOut"){
        document.getElementById('name3').textContent="Size out!";
        document.getElementsByClassName('imgLabel')[2].style.backgroundColor="green";
    }else{
        document.getElementById('name3').textContent="No page!";
        document.getElementsByClassName('imgLabel')[2].style.backgroundColor="green";
    }
    const visibleWraps =
        Array.from(imgWraps).filter(wrap => {
            return wrap.offsetParent !== null;
        });
    if (visibleWraps.length === 0) return;
    const rect = visibleWraps[0].getBoundingClientRect();
    const visibleImgs =
        Array.from(imgs).filter(img => {
            return img.offsetParent !== null;
        });
    if (visibleImgs.length === 0) return;
    const img = visibleImgs[0];
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    let drawW = iw;
    let drawH = ih;
    const rot = ((rotation % 360) + 360) % 360;
    if(rot === 90 || rot === 270){
        [drawW, drawH] = [ih, iw];
    }
    const scaleX = rect.width / drawW;
    const scaleY = rect.height / drawH;
    scale = Math.min(scaleX, scaleY);
    posX = 0;
    posY = 0;
    await updateTransform();
}
//transform適用
async function updateTransform() {
    const visibleWraps =
    Array.from(imgWraps).filter(wrap => {
        return wrap.offsetParent !== null;
    });
    if (visibleWraps.length === 0) return;
    const rect = visibleWraps[0].getBoundingClientRect();
    const visibleImgs =
        Array.from(imgs).filter(img => {
            return img.offsetParent !== null;
        });
    if (visibleImgs.length === 0) return;
    const img = visibleImgs[0];
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    let drawW = iw * scale;
    let drawH = ih * scale;
    if(rotation === 90 || rotation === 270){
        [drawW, drawH] = [drawH, drawW];
    }
    let limitX = Math.max(0, (drawW - rect.width) / 2);
    let limitY = Math.max(0, (drawH - rect.height) / 2);
    posX = await clamp(posX, -limitX, limitX);
    posY = await clamp(posY, -limitY, limitY);
    imgs.forEach(img => {
        img.style.transform =
            `
            translate(-50%, -50%)
            translate(${posX}px, ${posY}px)
            scale(${scale})
            rotate(${rotation}deg)
            `;
    });
}
//移動制限
async function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//マルチ表示
document.getElementById('imgsBt').onclick = async() => {
    if(json.aori==="false"){
        json.aori="true";
    }else{
        json.aori="false";
    }
    await changeImgMode();
};
//うっすら表示
document.getElementById('opcityBt').onclick = async() => {
    if(opImgs[0].style.opacity==="0"){
        document.getElementById('opcityBt').style.background="#777";
        opImgs.forEach(opa => {
            opa.style.opacity=json.opacity;
        });
        document.getElementById('sliderSpan').style.display="inline-block";
    }else{
        document.getElementById('opcityBt').style.background="none";
        opImgs.forEach(opa => {
            opa.style.opacity=0;
        });
        document.getElementById('sliderSpan').style.display="none";
    }
};
//タイマー
document.getElementById('clockBt').onclick = async() => {
    if(json.startStop==="true"){
        json.startStop="false";
    }else{
        json.startStop="true";
    };
    await timerChange();
};
//13 12 23 123
document.getElementById('changeBt13').onclick = async() => {
    json.mode="13";
    await changeImgMode();
};
document.getElementById('changeBt12').onclick = async() => {
    json.mode="12";
    await changeImgMode();
};
document.getElementById('changeBt23').onclick = async() => {
    json.mode="23";
    await changeImgMode();
};
document.getElementById('changeBt123').onclick = async() => {
    json.mode="123";
    await changeImgMode();
};
//ズームイン
document.getElementById('zoomInBt').onclick = async() => {
    await zoomAtCenter(1.1);
};
//ズームアウト
document.getElementById('zoomOutBt').onclick = async() => {
    await zoomAtCenter(1 / 1.1);
};
//zoom in out共通関数
async function zoomAtCenter(factor){
    const prevScale = scale;
    scale *= factor;
    scale = Math.max(0.1, Math.min(10, scale));
    const ratio = scale / prevScale;
    posX *= ratio;
    posY *= ratio;
    await updateTransform();
}
//リセット
document.getElementById('resetBt').onclick = async() => {
    await fitToScreen();
};
//回転
document.getElementById('rotateBt').onclick = async() => {
    rotation += 90;
    if(rotation >= 360){
        rotation = 0;
    }
    updateTransform();
}
//前の画像
document.getElementById('previewBt').onclick = async() => {
    if(pages!==1){
        pages-=1;
    }else{
        pages=json.pages;
    }
    await imgSet();
};
//次の画像
document.getElementById('nextBt').onclick = async() => {
    if(pages!==json.pages){
        pages+=1;
    }else{
        pages=1;
    }
    await imgSet();
};
//前後の画像セット
async function imgSet(){
    newVis=1.0;
    document.getElementById('newPixel').style.opacity=1.0;
    document.getElementById('newImg').style.opacity=newVis;
    deleteVis=1.0;
    document.getElementById('deletePixel').style.opacity=1.0;
    document.getElementById('deleteImg').style.opacity=deleteVis;
    changeVis=1.0;
    document.getElementById('changePixel').style.opacity=1.0;
    document.getElementById('changeImg').style.opacity=changeVis;
    viewImgs[0].src=`img1_${String(pages).padStart(3,"000")}.png`;
    viewImgs[1].src=`img2_${String(pages).padStart(3,"000")}.png`;
    viewImgs[2].src=`imgA_${String(pages).padStart(3,"000")}.png`;
    viewImgs[3].src=`imgB_${String(pages).padStart(3,"000")}.png`;
    viewImgs[4].src=`imgC_${String(pages).padStart(3,"000")}.png`;
    opImgs[0].src=`img2_${String(pages).padStart(3,"000")}.png`;
    opImgs[1].src=`img1_${String(pages).padStart(3,"000")}.png`;
    opImgs[2].src=`img1_${String(pages).padStart(3,"000")}.png`;
    document.getElementById('name1').textContent=`${json.name1} - page ${pages} / ${json.pages}`;
    document.getElementById('name2').textContent=`${json.name2} - page ${pages} / ${json.pages}`;
    document.getElementsByClassName('imgLabel')[0].style.backgroundColor="rgba(0,0,0,0.5)";
    document.getElementsByClassName('imgLabel')[1].style.backgroundColor="rgba(0,0,0,0.5)";
    if(saiFlag[pages-1]==="noImage1"){
        document.getElementById('name1').textContent=`${json.name1} - No page`;
        document.getElementsByClassName('imgLabel')[0].style.backgroundColor="green";
        opImgs[0].removeAttribute("src");
        opImgs[1].removeAttribute("src");
        opImgs[2].removeAttribute("src");
    }else if(saiFlag[pages-1]==="noImage2"){
        document.getElementById('name2').textContent=`${json.name2} - No page`;
        document.getElementsByClassName('imgLabel')[1].style.backgroundColor="green";
        opImgs[0].removeAttribute("src");
        opImgs[1].removeAttribute("src");
        opImgs[2].removeAttribute("src");
    }else if(saiFlag[pages-1]==="sizeOut"){
        opImgs[0].removeAttribute("src");
        opImgs[1].removeAttribute("src");
        opImgs[2].removeAttribute("src");
    }
    await fitToScreen();
}
//ドラッグ
viewer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
});
viewer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
});
viewer.addEventListener('mouseup', () => {
    isDragging = false;
});
viewer.addEventListener('mouseleave', () => {
    isDragging = false;
});
//画像表示の切り替え
async function changeImgMode(){
    viewer.classList.add(json.align);
    imgWraps.forEach(wrap => {
        wrap.style.display="none";
    });
    imgPats.forEach(imgPat => {
        imgPat.style.background="none";
    });
    document.getElementById('spaceSpan').style.display="none";
    document.getElementById('clockBt').style.display="none";
    document.getElementById('imgsBt').style.background="#777";
    document.getElementById('pixelsSpan').style.display="inline-block";
    if(json.aori==="true"){
        if(json.mode==="23"){
            imgWraps[1].style.display="block";
        }else{
            imgWraps[0].style.display="block";
        }
        if(json.mode==="12"){
            document.getElementById('pixelsSpan').style.display="none";
        }
        document.getElementById('spaceSpan').style.display="inline-block";
        document.getElementById('clockBt').style.display="block";
        document.getElementById('imgsBt').style.background="none";
    }else if(json.mode==="123"){
        imgWraps.forEach(wrap => {
            wrap.style.display="block";
        });
    }else if(json.mode==="12"){
        imgWraps[0].style.display="block";
        imgWraps[1].style.display="block";
        document.getElementById('pixelsSpan').style.display="none";
    }else if(json.mode==="13"){
        imgWraps[0].style.display="block";
        imgWraps[2].style.display="block";
    }else if(json.mode==="23"){
        imgWraps[1].style.display="block";
        imgWraps[2].style.display="block";
    }
    document.getElementById('changeBt'+json.mode).style.background="#777";
    if(json.opacity===0){
        document.getElementById('opcityBt').style.background="none";
        document.getElementById('sliderSpan').style.display="none";
    }else{
        document.getElementById('opcityBt').style.background="#777";
        document.getElementById('sliderSpan').style.display="inline-block";
    }
    opImgs.forEach(opa => {
        opa.style.opacity=json.opacity;
    });
    await fitToScreen();
}
//タイマーの切り替え
async function timerChange(){
    clearInterval(imgTimer);
    if(json.startStop==="true"){
        imgTimer = setInterval(async() => {
            await aoriClick();
        },json.timerTime);
        document.getElementById('clockBt').style.background="#777";
    }else{
        document.getElementById('clockBt').style.background="none";
    };
}
//画像・テキスト切り替え、falseで画像
async function chengeIT(bool){
    document.getElementById('spaceSpan').style.display="none";
    document.getElementById('wheelSpan').style.display="none";
    document.getElementById('pixelsSpan').style.display="none";
    document.getElementById('licenseSpan').style.display="none";
    if(bool==="true"){
        viewer.style.display="none";
        textMain.style.display="block";
        document.getElementById('licenseSpan').style.display="inline-block";
        document.getElementById('sliderSpan').style.display="none";
        if(toggle.textContent==="▲"){
            if(firstMergy){
                toggle.dispatchEvent(new Event('click',{bubbles:true}));
            };
        }
        toolDiv.style.display="none";
        document.getElementById('compare').textContent="";
        const doc = new Mergely('#compare', {
            lhs: text1,
            rhs: text2,
            wrap_lines: true,
            license: 'lgpl-separate-notice'
        });
        firstMergy=false;
    }else{
        viewer.style.display="flex";
        textMain.style.display="none";
        toolDiv.style.display="block";
        document.getElementById('wheelSpan').style.display="inline-block";
        console.log(opImgs[0].style.opacity!=="0")
        if(opImgs[0].style.opacity!=="0"){
            document.getElementById('sliderSpan').style.display="inline-block";
        }
        if(json.opacity)
        if(json.mode==="123"||json.mode==="13"||json.mode==="23"){
            document.getElementById('pixelsSpan').style.display="inline-block";
        }
        if(json.aori==="true"){
            document.getElementById('spaceSpan').style.display="inline-block";
        }
        await fitToScreen();
    };
}
//あおりスペース
async function aoriClick(){
    if(json.aori==="true"){
        if(json.mode==="13"){
            if(imgWraps[0].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="block";
            }else if(imgWraps[2].style.display==="block"){
                imgWraps[0].style.display="block";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="none";
            }
        }else if(json.mode==="12"){
            if(imgWraps[0].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="block";
                imgWraps[2].style.display="none";
            }else if(imgWraps[1].style.display==="block"){
                imgWraps[0].style.display="block";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="none";
            }
        }else if(json.mode==="123"){
            if(imgWraps[0].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="block";
                imgWraps[2].style.display="none";
            }else if(imgWraps[1].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="block";
            }else if(imgWraps[2].style.display==="block"){
                imgWraps[0].style.display="block";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="none";
            };
        }else if(json.mode==="23"){
            if(imgWraps[1].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="none";
                imgWraps[2].style.display="block";
            }else if(imgWraps[2].style.display==="block"){
                imgWraps[0].style.display="none";
                imgWraps[1].style.display="block";
                imgWraps[2].style.display="none";
            }
        }
    }
};
//newPixels
document.getElementById('newPixel').onclick = async() => {
    if(newVis===1.0){
        newVis=0;
        document.getElementById('newPixel').style.opacity=0.2;
    }else{
        newVis=1.0;
        document.getElementById('newPixel').style.opacity=1.0;
    }
    document.getElementById('newImg').style.opacity=newVis;
};
//deletePixels
document.getElementById('deletePixel').onclick = async() => {
    if(deleteVis===1.0){
        deleteVis=0;
        document.getElementById('deletePixel').style.opacity=0.2;
    }else{
        deleteVis=1.0;
        document.getElementById('deletePixel').style.opacity=1.0;
    }
    document.getElementById('deleteImg').style.opacity=deleteVis;
};
//changePixels
document.getElementById('changePixel').onclick = async() => {
    if(changeVis===1.0){
        changeVis=0;
        document.getElementById('changePixel').style.opacity=0.2;
    }else{
        changeVis=1.0;
        document.getElementById('changePixel').style.opacity=1.0;
    };
    document.getElementById('changeImg').style.opacity=changeVis;
};
//ホイールズーム
viewer.addEventListener('wheel', async(e) => {
    e.preventDefault();
    const wrap = e.target.closest('.imgWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const prevScale = scale;
    const zoomFactor = 1.1;
    let newScale =
        e.deltaY < 0
        ? scale * zoomFactor
        : scale / zoomFactor;
    newScale = Math.max(0.1, Math.min(10, newScale));
    const ratio = newScale / prevScale;
    posX = ratio * posX + (1 - ratio) * dx;
    posY = ratio * posY + (1 - ratio) * dy;
    scale = newScale;
    await updateTransform();
}, { passive:false });