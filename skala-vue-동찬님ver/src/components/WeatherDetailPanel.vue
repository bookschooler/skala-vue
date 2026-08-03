<script setup>
defineProps({ city: String, detail: Object, loading: Boolean, error: String })
defineEmits(['close', 'retry'])
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <aside class="panel" role="dialog" aria-modal="true" aria-labelledby="weather-detail-title">
      <button class="close" type="button" aria-label="상세 닫기" @click="$emit('close')">×</button>
      <div v-if="loading" class="state">{{ city }} 날씨를 불러오고 있어요…</div>
      <div v-else-if="error" class="state error">
        <strong>{{ error }}</strong><button type="button" @click="$emit('retry')">다시 시도</button>
      </div>
      <template v-else-if="detail">
        <header class="topline">
          <div><small>{{ detail.basis }}</small><h2 id="weather-detail-title">{{ detail.city }} {{ detail.current.temp }}℃</h2></div>
          <span class="demo fallback" v-if="detail.isFallback">임시 데이터</span>
          <span class="demo live" v-else-if="!detail.isDemo">실시간</span>
          <span class="demo" v-else>DEMO</span>
        </header>
        <section class="hero" :class="`hero-${detail.advice.type}`">
          <div class="character" aria-hidden="true">
            <span class="face">● ◡ ●</span>
            <span class="outfit">{{ detail.advice.outfit }}</span>
          </div>
          <div class="brief"><p>{{ detail.current.status }} · 자외선 {{ detail.uv }}</p><h3>{{ detail.advice.headline }}</h3><p>{{ detail.advice.description }}</p>
            <div class="items"><span v-for="item in detail.advice.items" :key="item">{{ item }}</span></div>
          </div>
        </section>
        <section class="timeline"><h3>시간별 날씨</h3><div class="hours"><div v-for="hour in detail.hourly" :key="hour.time"><b>{{ hour.time }}시</b><span>{{ hour.temp }}°</span><small>강수 {{ hour.rainProbability }}%</small><small v-if="hour.rainMm > 0">{{ hour.rainMm }}mm</small></div></div></section>
        <section class="metrics">
          <div><small>자외선</small><strong>{{ detail.uv }} {{ detail.uv >= 6 ? '높음' : detail.uv >= 3 ? '보통' : '낮음' }}</strong></div><div><small>미세먼지</small><strong>{{ detail.airQuality.grade }} · PM10 {{ detail.airQuality.pm10 }}</strong></div>
          <div><small>일출</small><strong>{{ detail.sunrise }}</strong></div><div><small>일몰</small><strong>{{ detail.sunset }}</strong></div>
        </section>
        <footer>{{ detail.source }} · {{ detail.updatedAt }} 기준</footer>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.backdrop{position:fixed;inset:0;z-index:50;display:flex;justify-content:flex-end;background:#20364c77}.panel{position:relative;width:min(520px,100%);height:100%;overflow:auto;padding:28px;background:linear-gradient(155deg,#75bdf2 0%,#8bd3db 55%,#eaf6ff 100%);color:#173b5d;box-shadow:-16px 0 40px #193b5d33}.close{position:absolute;right:18px;top:14px;width:44px;height:44px;border:0;border-radius:50%;background:#ffffff80;font-size:28px;cursor:pointer}.topline{display:flex;align-items:end;justify-content:space-between;padding-right:48px}.topline h2{font-size:34px}.demo{padding:4px 9px;border-radius:99px;background:#173b5d;color:#fff;font-size:11px}.demo.live{background:#137a4f}.demo.fallback{background:#a65d00}.hero{display:grid;grid-template-columns:150px 1fr;gap:20px;margin:22px 0;padding:22px;border-radius:28px;background:#ffffff55;backdrop-filter:blur(14px)}.character{min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border-radius:70px 70px 24px 24px;background:linear-gradient(#fff7d6,#b7e2f8);border:5px solid #ffffff66}.face{font-size:22px}.outfit{padding:10px;text-align:center;font-weight:700}.brief{align-self:center}.brief h3{margin:8px 0;font-size:25px;line-height:1.25}.items{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.items span{padding:6px 10px;border-radius:99px;background:#fff}.timeline,.metrics{margin-top:16px;padding:18px;border-radius:22px;background:#ffffff88}.hours{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:12px}.hours div{display:flex;flex-direction:column;align-items:center;padding:8px 2px;border-radius:12px;background:#ffffff66}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px}.metrics div{display:flex;flex-direction:column;padding:10px;border-bottom:1px solid #ffffff}.panel footer{padding:20px 4px;font-size:12px;color:#3f6684}.state{display:grid;place-items:center;height:70vh;font-size:18px}.state.error{gap:12px}.state button{padding:10px 16px;border:0;border-radius:10px}.hero-rain{background:#5595c777}@media(max-width:600px){.panel{height:90%;margin-top:auto;border-radius:28px 28px 0 0;padding:22px}.hero{grid-template-columns:110px 1fr}.character{min-height:190px}.brief h3{font-size:21px}.hours{overflow-x:auto;grid-template-columns:repeat(6,64px)}}
</style>
