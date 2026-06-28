
export default function Hero() {
  return (
    <div className="relative py-12 md:py-16 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
        Açık Kaynak Kod İçin <br className="sm:hidden" />
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Mikro-Bağış Portalı
        </span>
      </h1>
      <p className="mx-auto max-w-xl text-base md:text-lg text-gray-400 leading-relaxed px-4">
        Freighter cüzdanınızı bağlayın, açık kaynaklı geliştiricilerin projelerini testnet üzerinde XLM ile doğrudan fonlayın.
      </p>
    </div>
  )
}
