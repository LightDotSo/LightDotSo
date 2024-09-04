// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { cn } from "@lightdotso/utils";
import type { FC, SVGProps } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type LightAppLogoProps = SVGProps<SVGSVGElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const LightAppLogo: FC<LightAppLogoProps> = ({
  className,
  ...props
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <svg
      width="144"
      height="144"
      viewBox="0 0 144 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <title>Light App Logo</title>
      <rect
        x="0.75"
        y="0.75"
        width="142.5"
        height="142.5"
        rx="35.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="6.75"
        y="6.75"
        width="130.5"
        height="130.5"
        rx="29.25"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <g clipPath="url(#clip0_11874_12891)">
        <mask id="path-6-inside-1_11874_12891" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M72.0003 18C62.4242 17.9885 53.0192 20.537 44.7592 25.3816H99.2377C90.9788 20.5377 81.5751 17.9892 72.0003 18ZM111.094 34.77C113.273 37.0531 115.249 39.5224 116.998 42.1496H26.998C28.2902 40.2377 29.7044 38.4111 31.2319 36.6813H31.167C31.2993 36.5304 31.44 36.3895 31.5804 36.249L31.5805 36.2489C31.6996 36.1297 31.8184 36.0108 31.9316 35.8862C32.0712 35.7313 32.206 35.572 32.3408 35.4127L32.3409 35.4126L32.3409 35.4125C32.5254 35.1945 32.7098 34.9765 32.9064 34.77H32.9982C34.8476 32.8011 36.8411 30.9726 38.9622 29.2998H68.8202C66.6983 30.9716 64.7047 32.8002 62.8562 34.77H111.094ZM124.398 58.9147C123.771 56.3993 122.963 53.9329 121.978 51.5351H51.9106C52.666 49.6654 53.525 47.8392 54.4835 46.0649H24.6255C23.6668 47.8388 22.8085 49.6651 22.0545 51.5351H22.022C21.9697 51.6639 21.9232 51.7964 21.8767 51.9289L21.8766 51.929L21.8766 51.929C21.8348 52.0483 21.7929 52.1676 21.7467 52.2844C21.6879 52.4314 21.6252 52.5784 21.562 52.7263C21.461 52.9629 21.359 53.2018 21.2707 53.4465H21.3186C20.6465 55.2367 20.0721 57.0622 19.5981 58.9147H124.398ZM125.862 68.3057H48.0301C48.1424 66.4737 48.3478 64.6485 48.6455 62.8374H18.7895C18.4901 64.6484 18.2841 66.4735 18.1721 68.3057H18.1395C18.1242 68.5249 18.1183 68.7441 18.1124 68.9611C18.108 69.1225 18.1037 69.2828 18.0956 69.441C18.0901 69.5644 18.0804 69.6866 18.0706 69.8089C18.0598 69.9441 18.049 70.0795 18.044 70.217H18.067C18.0595 70.4087 18.0499 70.5998 18.0403 70.7909C18.0201 71.1906 18 71.5904 18 71.9964C18 73.2369 18.0573 74.4658 18.1395 75.6853H125.862C125.944 74.4658 126.001 73.2369 126.001 71.9964C126.001 70.756 125.944 69.527 125.862 68.3057ZM37.0505 113.142H66.9085C69.3197 115.19 71.9057 117.023 74.6368 118.619H99.2419C90.9819 123.464 81.5769 126.012 72.0008 126.001C63.8051 126.004 55.7172 124.132 48.3571 120.527H48.3074C48.2547 120.499 48.2034 120.471 48.1525 120.442L48.1519 120.442L48.1516 120.442C48.0865 120.405 48.0221 120.369 47.9558 120.336C47.7949 120.256 47.6369 120.171 47.4788 120.085C47.3756 120.029 47.2724 119.973 47.1682 119.919C46.4151 119.529 45.6676 119.132 44.9355 118.707C44.9049 118.689 44.8731 118.672 44.8411 118.655L44.841 118.655C44.8132 118.641 44.7852 118.626 44.7577 118.61H44.7788C42.0481 117.016 39.462 115.186 37.0505 113.142ZM53.6786 96.375H23.8206C24.7924 98.2593 25.8737 100.085 27.0587 101.843H27.0013C27.1191 102.019 27.2463 102.187 27.3734 102.355C27.4753 102.49 27.5772 102.624 27.6742 102.763C27.7711 102.901 27.8668 103.049 27.9638 103.199C28.085 103.386 28.208 103.576 28.3376 103.755H28.3987C29.7813 105.673 31.2869 107.501 32.906 109.225H111.087C113.267 106.941 115.242 104.471 116.992 101.843H56.911C55.7266 100.086 54.6471 98.26 53.6786 96.375ZM18.5431 79.6055H48.4011C48.6714 81.4464 49.0389 83.2717 49.5021 85.0737H124.398C123.771 87.5891 122.963 90.0555 121.978 92.4533H22.0221C21.3024 90.6652 20.679 88.8398 20.1545 86.9851H20.124C20.0815 86.839 20.0463 86.6895 20.0111 86.54C19.9813 86.4137 19.9516 86.2875 19.9175 86.1632C19.875 86.0073 19.8284 85.8531 19.7817 85.6988C19.7191 85.492 19.6565 85.285 19.604 85.0737H19.6441C19.1818 83.2715 18.8143 81.4462 18.5431 79.6055Z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M72.0003 18C62.4242 17.9885 53.0192 20.537 44.7592 25.3816H99.2377C90.9788 20.5377 81.5751 17.9892 72.0003 18ZM111.094 34.77C113.273 37.0531 115.249 39.5224 116.998 42.1496H26.998C28.2902 40.2377 29.7044 38.4111 31.2319 36.6813H31.167C31.2993 36.5304 31.44 36.3895 31.5804 36.249L31.5805 36.2489C31.6996 36.1297 31.8184 36.0108 31.9316 35.8862C32.0712 35.7313 32.206 35.572 32.3408 35.4127L32.3409 35.4126L32.3409 35.4125C32.5254 35.1945 32.7098 34.9765 32.9064 34.77H32.9982C34.8476 32.8011 36.8411 30.9726 38.9622 29.2998H68.8202C66.6983 30.9716 64.7047 32.8002 62.8562 34.77H111.094ZM124.398 58.9147C123.771 56.3993 122.963 53.9329 121.978 51.5351H51.9106C52.666 49.6654 53.525 47.8392 54.4835 46.0649H24.6255C23.6668 47.8388 22.8085 49.6651 22.0545 51.5351H22.022C21.9697 51.6639 21.9232 51.7964 21.8767 51.9289L21.8766 51.929L21.8766 51.929C21.8348 52.0483 21.7929 52.1676 21.7467 52.2844C21.6879 52.4314 21.6252 52.5784 21.562 52.7263C21.461 52.9629 21.359 53.2018 21.2707 53.4465H21.3186C20.6465 55.2367 20.0721 57.0622 19.5981 58.9147H124.398ZM125.862 68.3057H48.0301C48.1424 66.4737 48.3478 64.6485 48.6455 62.8374H18.7895C18.4901 64.6484 18.2841 66.4735 18.1721 68.3057H18.1395C18.1242 68.5249 18.1183 68.7441 18.1124 68.9611C18.108 69.1225 18.1037 69.2828 18.0956 69.441C18.0901 69.5644 18.0804 69.6866 18.0706 69.8089C18.0598 69.9441 18.049 70.0795 18.044 70.217H18.067C18.0595 70.4087 18.0499 70.5998 18.0403 70.7909C18.0201 71.1906 18 71.5904 18 71.9964C18 73.2369 18.0573 74.4658 18.1395 75.6853H125.862C125.944 74.4658 126.001 73.2369 126.001 71.9964C126.001 70.756 125.944 69.527 125.862 68.3057ZM37.0505 113.142H66.9085C69.3197 115.19 71.9057 117.023 74.6368 118.619H99.2419C90.9819 123.464 81.5769 126.012 72.0008 126.001C63.8051 126.004 55.7172 124.132 48.3571 120.527H48.3074C48.2547 120.499 48.2034 120.471 48.1525 120.442L48.1519 120.442L48.1516 120.442C48.0865 120.405 48.0221 120.369 47.9558 120.336C47.7949 120.256 47.6369 120.171 47.4788 120.085C47.3756 120.029 47.2724 119.973 47.1682 119.919C46.4151 119.529 45.6676 119.132 44.9355 118.707C44.9049 118.689 44.8731 118.672 44.8411 118.655L44.841 118.655C44.8132 118.641 44.7852 118.626 44.7577 118.61H44.7788C42.0481 117.016 39.462 115.186 37.0505 113.142ZM53.6786 96.375H23.8206C24.7924 98.2593 25.8737 100.085 27.0587 101.843H27.0013C27.1191 102.019 27.2463 102.187 27.3734 102.355C27.4753 102.49 27.5772 102.624 27.6742 102.763C27.7711 102.901 27.8668 103.049 27.9638 103.199C28.085 103.386 28.208 103.576 28.3376 103.755H28.3987C29.7813 105.673 31.2869 107.501 32.906 109.225H111.087C113.267 106.941 115.242 104.471 116.992 101.843H56.911C55.7266 100.086 54.6471 98.26 53.6786 96.375ZM18.5431 79.6055H48.4011C48.6714 81.4464 49.0389 83.2717 49.5021 85.0737H124.398C123.771 87.5891 122.963 90.0555 121.978 92.4533H22.0221C21.3024 90.6652 20.679 88.8398 20.1545 86.9851H20.124C20.0815 86.839 20.0463 86.6895 20.0111 86.54C19.9813 86.4137 19.9516 86.2875 19.9175 86.1632C19.875 86.0073 19.8284 85.8531 19.7817 85.6988C19.7191 85.492 19.6565 85.285 19.604 85.0737H19.6441C19.1818 83.2715 18.8143 81.4462 18.5431 79.6055Z"
          fill="url(#paint0_linear_11874_12891)"
        />
        <path
          d="M44.7592 25.3816L44.0003 24.0877L39.2368 26.8816H44.7592V25.3816ZM72.0003 18L71.9985 19.5L72.002 19.5L72.0003 18ZM99.2377 25.3816V26.8816H104.76L99.9966 24.0877L99.2377 25.3816ZM116.998 42.1496V43.6496H119.799L118.247 41.3182L116.998 42.1496ZM111.094 34.77L112.179 33.7343L111.735 33.27H111.094V34.77ZM26.998 42.1496L25.7552 41.3096L24.1737 43.6496H26.998V42.1496ZM31.2319 36.6813L32.3563 37.6742L34.5577 35.1813H31.2319V36.6813ZM31.167 36.6813L30.0391 35.6924L27.8568 38.1813H31.167V36.6813ZM31.5804 36.249L30.5197 35.1884L30.5192 35.1889L31.5804 36.249ZM31.5805 36.2489L32.6411 37.3096L32.6416 37.3091L31.5805 36.2489ZM31.9316 35.8862L33.0418 36.8949L33.0459 36.8903L31.9316 35.8862ZM32.3408 35.4127L31.2119 34.4249L31.2037 34.4343L31.1956 34.4438L32.3408 35.4127ZM32.3409 35.4126L33.4697 36.4003L33.4816 36.3867L33.4932 36.3729L32.3409 35.4126ZM32.3409 35.4125L31.1957 34.4437L31.1885 34.4523L32.3409 35.4125ZM32.9064 34.77V33.27H32.2634L31.82 33.7358L32.9064 34.77ZM32.9982 34.77V36.27H33.6472L34.0915 35.797L32.9982 34.77ZM38.9622 29.2998V27.7998H38.4418L38.0333 28.122L38.9622 29.2998ZM68.8202 29.2998L69.7485 30.478L73.1477 27.7998H68.8202V29.2998ZM62.8562 34.77L61.7624 33.7436L59.3916 36.27H62.8562V34.77ZM121.978 51.5351L123.365 50.9652L122.983 50.0351H121.978V51.5351ZM124.398 58.9147V60.4147H126.317L125.853 58.5524L124.398 58.9147ZM51.9106 51.5351L50.5198 50.9732L49.6867 53.0351H51.9106V51.5351ZM54.4835 46.0649L55.8032 46.7779L56.9988 44.5649H54.4835V46.0649ZM24.6255 46.0649V44.5649H23.7311L23.3058 45.3518L24.6255 46.0649ZM22.0545 51.5351V53.0351H23.0671L23.4457 52.0961L22.0545 51.5351ZM22.022 51.5351V50.0351H21.0123L20.6323 50.9705L22.022 51.5351ZM21.8767 51.9289L20.4612 51.4322L20.4581 51.4413L21.8767 51.9289ZM21.8766 51.929L23.2906 52.4298L23.2952 52.4166L21.8766 51.929ZM21.8766 51.929L20.4627 51.4282L20.4612 51.4324L21.8766 51.929ZM21.7467 52.2844L23.1395 52.8415L23.1417 52.8359L21.7467 52.2844ZM21.562 52.7263L22.9415 53.3154L22.9415 53.3154L21.562 52.7263ZM21.2707 53.4465L19.8597 52.9376L19.1352 54.9465H21.2707V53.4465ZM21.3186 53.4465L22.7229 53.9736L23.4839 51.9465H21.3186V53.4465ZM19.5981 58.9147L18.145 58.5429L17.6661 60.4147H19.5981V58.9147ZM48.0301 68.3057L46.5329 68.2139L46.4354 69.8057H48.0301V68.3057ZM125.862 68.3057L127.358 68.2049L127.264 66.8057H125.862V68.3057ZM48.6455 62.8374L50.1257 63.0808L50.4123 61.3374H48.6455V62.8374ZM18.7895 62.8374V61.3374H17.5171L17.3096 62.5928L18.7895 62.8374ZM18.1721 68.3057V69.8057H19.5832L19.6693 68.3972L18.1721 68.3057ZM18.1395 68.3057V66.8057H16.7409L16.6432 68.2009L18.1395 68.3057ZM18.1124 68.9611L16.613 68.9206L16.613 68.9206L18.1124 68.9611ZM18.0956 69.441L16.5975 69.3638L16.597 69.3749L18.0956 69.441ZM18.0706 69.8089L16.5754 69.6896L16.5754 69.6896L18.0706 69.8089ZM18.044 70.217L16.545 70.1623L16.4882 71.717H18.044V70.217ZM18.067 70.217L19.5658 70.275L19.6262 68.717H18.067V70.217ZM18.0403 70.7909L19.5384 70.8664L19.5384 70.8664L18.0403 70.7909ZM18.1395 75.6853L16.6429 75.7861L16.7372 77.1853H18.1395V75.6853ZM125.862 75.6853V77.1853H127.264L127.358 75.7861L125.862 75.6853ZM66.9085 113.142L67.8796 111.998L67.4596 111.642H66.9085V113.142ZM37.0505 113.142V111.642H32.962L36.0804 114.286L37.0505 113.142ZM74.6368 118.619L73.8798 119.914L74.2305 120.119H74.6368V118.619ZM99.2419 118.619L100.001 119.913L104.764 117.119H99.2419V118.619ZM72.0008 126.001L72.0026 124.501L72.0002 124.501L72.0008 126.001ZM48.3571 120.527L49.0169 119.18L48.7047 119.027H48.3571V120.527ZM48.3074 120.527L47.6115 121.856L47.9384 122.027H48.3074V120.527ZM48.1525 120.442L47.4082 121.744L47.4194 121.751L48.1525 120.442ZM48.1519 120.442L48.8961 119.139L48.8864 119.134L48.8765 119.128L48.1519 120.442ZM48.1516 120.442L47.4183 121.75L47.427 121.755L48.1516 120.442ZM47.9558 120.336L48.6266 118.994L48.6226 118.992L47.9558 120.336ZM47.4788 120.085L48.1922 118.766L48.1922 118.766L47.4788 120.085ZM47.1682 119.919L47.862 118.589L47.8579 118.587L47.1682 119.919ZM44.9355 118.707L44.1638 119.994L44.1735 119.999L44.1834 120.005L44.9355 118.707ZM44.8411 118.655L45.541 117.329L45.5058 117.31L45.4697 117.293L44.8411 118.655ZM44.841 118.655L44.1411 119.982L44.1763 120.001L44.2124 120.017L44.841 118.655ZM44.7577 118.61V117.11H39.1869L44.0045 119.907L44.7577 118.61ZM44.7788 118.61V120.11H50.3248L45.5349 117.314L44.7788 118.61ZM23.8206 96.375V94.875H21.3592L22.4874 97.0626L23.8206 96.375ZM53.6786 96.375L55.0128 95.6895L54.5943 94.875H53.6786V96.375ZM27.0587 101.843V103.343H29.8788L28.3026 101.005L27.0587 101.843ZM27.0013 101.843V100.343H24.1937L25.7545 102.677L27.0013 101.843ZM27.3734 102.355L26.1778 103.261L26.1778 103.261L27.3734 102.355ZM27.6742 102.763L28.9033 101.903L28.9033 101.903L27.6742 102.763ZM27.9638 103.199L26.7046 104.014L26.7046 104.014L27.9638 103.199ZM28.3376 103.755L27.1239 104.636L27.5731 105.255H28.3376V103.755ZM28.3987 103.755L29.6157 102.878L29.1667 102.255H28.3987V103.755ZM32.906 109.225L31.8126 110.252L32.2569 110.725H32.906V109.225ZM111.087 109.225V110.725H111.73L112.173 110.26L111.087 109.225ZM116.992 101.843L118.241 102.675L119.793 100.343H116.992V101.843ZM56.911 101.843L55.6672 102.682L56.1132 103.343H56.911V101.843ZM48.4011 79.6055L49.8852 79.3876L49.697 78.1055H48.4011V79.6055ZM18.5431 79.6055V78.1055H16.8059L17.0591 79.8241L18.5431 79.6055ZM49.5021 85.0737L48.0494 85.4472L48.339 86.5737H49.5021V85.0737ZM124.398 85.0737L125.853 85.4361L126.317 83.5737H124.398V85.0737ZM121.978 92.4533V93.9533H122.983L123.365 93.0233L121.978 92.4533ZM22.0221 92.4533L20.6306 93.0134L21.0089 93.9533H22.0221V92.4533ZM20.1545 86.9851L21.5979 86.5769L21.2892 85.4851H20.1545V86.9851ZM20.124 86.9851L18.6836 87.4039L18.9981 88.4851H20.124V86.9851ZM20.0111 86.54L21.4711 86.1961L21.4711 86.1961L20.0111 86.54ZM19.9175 86.1632L18.4702 86.5573L18.471 86.5605L19.9175 86.1632ZM19.7817 85.6988L18.3459 86.1331L18.3459 86.1331L19.7817 85.6988ZM19.604 85.0737V83.5737H17.6852L18.1483 85.4358L19.604 85.0737ZM19.6441 85.0737V86.5737H21.5775L21.0971 84.701L19.6441 85.0737ZM45.5181 26.6754C53.5474 21.9662 62.6898 19.4889 71.9985 19.5L72.0021 16.5C62.1586 16.4882 52.491 19.1079 44.0003 24.0877L45.5181 26.6754ZM99.2377 23.8816H44.7592V26.8816H99.2377V23.8816ZM72.002 19.5C81.3095 19.4895 90.4506 21.9668 98.4788 26.6754L99.9966 24.0877C91.5071 19.1085 81.8408 16.4889 71.9986 16.5L72.002 19.5ZM118.247 41.3182C116.449 38.6183 114.418 36.0806 112.179 33.7343L110.009 35.8058C112.128 38.0257 114.049 40.4265 115.75 42.981L118.247 41.3182ZM26.998 43.6496H116.998V40.6496H26.998V43.6496ZM30.1076 35.6884C28.5373 37.4666 27.0836 39.3442 25.7552 41.3096L28.2408 42.9895C29.4969 41.1311 30.8715 39.3556 32.3563 37.6742L30.1076 35.6884ZM31.167 38.1813H31.2319V35.1813H31.167V38.1813ZM30.5192 35.1889C30.3844 35.3238 30.2089 35.4987 30.0391 35.6924L32.2948 37.6702C32.3897 37.562 32.4957 37.4552 32.6416 37.3092L30.5192 35.1889ZM30.5198 35.1883L30.5197 35.1884L32.6411 37.3097L32.6411 37.3096L30.5198 35.1883ZM30.8214 34.8775C30.7361 34.9714 30.6426 35.0654 30.5193 35.1888L32.6416 37.3091C32.7566 37.1941 32.9007 37.0502 33.0418 36.8949L30.8214 34.8775ZM31.1956 34.4438C31.0584 34.6061 30.9386 34.7474 30.8173 34.882L33.0459 36.8903C33.2038 36.7151 33.3536 36.5378 33.4859 36.3815L31.1956 34.4438ZM31.212 34.4248L31.2119 34.4249L33.4696 36.4004L33.4697 36.4003L31.212 34.4248ZM31.1885 34.4523L31.1885 34.4523L33.4932 36.3729L33.4932 36.3728L31.1885 34.4523ZM31.82 33.7358C31.588 33.9794 31.3755 34.2313 31.1958 34.4437L33.486 36.3814C33.6753 36.1577 33.8316 35.9736 33.9928 35.8043L31.82 33.7358ZM32.9982 33.27H32.9064V36.27H32.9982V33.27ZM38.0333 28.122C35.8538 29.841 33.8053 31.7198 31.9049 33.743L34.0915 35.797C35.89 33.8823 37.8285 32.1043 39.8911 30.4776L38.0333 28.122ZM68.8202 27.7998H38.9622V30.7998H68.8202V27.7998ZM63.9501 35.7964C65.7473 33.8813 67.6855 32.1035 69.7485 30.478L67.8919 28.1216C65.7111 29.8398 63.6622 31.7191 61.7624 33.7436L63.9501 35.7964ZM111.094 33.27H62.8562V36.27H111.094V33.27ZM120.59 52.1051C121.547 54.4354 122.333 56.8324 122.942 59.2771L125.853 58.5524C125.209 55.9662 124.378 53.4304 123.365 50.9652L120.59 52.1051ZM51.9106 53.0351H121.978V50.0351H51.9106V53.0351ZM53.1638 45.352C52.1788 47.1752 51.2961 49.0518 50.5198 50.9732L53.3013 52.097C54.0359 50.279 54.8712 48.5032 55.8032 46.7779L53.1638 45.352ZM24.6255 47.5649H54.4835V44.5649H24.6255V47.5649ZM23.4457 52.0961C24.1787 50.278 25.0131 48.5026 25.9451 46.7781L23.3058 45.3518C22.3205 47.175 21.4383 49.0521 20.6633 50.9742L23.4457 52.0961ZM22.022 53.0351H22.0545V50.0351H22.022V53.0351ZM23.2921 52.4255C23.3407 52.287 23.3753 52.1891 23.4116 52.0998L20.6323 50.9705C20.564 51.1386 20.5057 51.3057 20.4613 51.4323L23.2921 52.4255ZM23.2952 52.4166L23.2952 52.4165L20.4581 51.4413L20.4581 51.4414L23.2952 52.4166ZM23.2906 52.4298L23.2906 52.4297L20.4627 51.4282L20.4627 51.4282L23.2906 52.4298ZM23.1417 52.8359C23.2004 52.6873 23.2519 52.5401 23.292 52.4256L20.4612 51.4324C20.4177 51.5564 20.3854 51.6479 20.3518 51.7328L23.1417 52.8359ZM22.9415 53.3154C23.0035 53.1703 23.0731 53.0073 23.1394 52.8415L20.354 51.7272C20.3027 51.8555 20.2468 51.9866 20.1825 52.1372L22.9415 53.3154ZM22.6818 53.9553C22.753 53.7579 22.8377 53.5585 22.9415 53.3154L20.1825 52.1372C20.0842 52.3674 19.965 52.6457 19.8597 52.9376L22.6818 53.9553ZM21.3186 51.9465H21.2707V54.9465H21.3186V51.9465ZM21.0513 59.2865C21.5118 57.4866 22.0699 55.7131 22.7229 53.9736L19.9143 52.9193C19.2231 54.7604 18.6324 56.6377 18.145 58.5429L21.0513 59.2865ZM124.398 57.4147H19.5981V60.4147H124.398V57.4147ZM48.0301 69.8057H125.862V66.8057H48.0301V69.8057ZM47.1654 62.594C46.8594 64.4554 46.6483 66.3311 46.5329 68.2139L49.5273 68.3974C49.6365 66.6162 49.8362 64.8417 50.1257 63.0808L47.1654 62.594ZM18.7895 64.3374H48.6455V61.3374H18.7895V64.3374ZM19.6693 68.3972C19.7781 66.6163 19.9784 64.8423 20.2694 63.082L17.3096 62.5928C17.0018 64.4545 16.79 66.3307 16.6749 68.2142L19.6693 68.3972ZM18.1395 69.8057H18.1721V66.8057H18.1395V69.8057ZM19.6119 69.0016C19.6179 68.7793 19.6231 68.5922 19.6359 68.4104L16.6432 68.2009C16.6252 68.4575 16.6187 68.7088 16.613 68.9206L19.6119 69.0016ZM19.5936 69.5182C19.6028 69.3386 19.6076 69.1598 19.6119 69.0016L16.613 68.9206C16.6085 69.0853 16.6046 69.227 16.5975 69.3638L19.5936 69.5182ZM19.5658 69.9282C19.5753 69.8102 19.5873 69.6616 19.5941 69.5071L16.597 69.3749C16.5929 69.4673 16.5855 69.563 16.5754 69.6896L19.5658 69.9282ZM19.543 70.2717C19.5466 70.1718 19.5547 70.0685 19.5658 69.9282L16.5754 69.6896C16.565 69.8197 16.5514 69.9872 16.545 70.1623L19.543 70.2717ZM18.067 68.717H18.044V71.717H18.067V68.717ZM19.5384 70.8664C19.5479 70.6767 19.558 70.4769 19.5658 70.275L16.5681 70.159C16.5611 70.3405 16.5519 70.5229 16.5422 70.7154L19.5384 70.8664ZM19.5 71.9964C19.5 71.6344 19.518 71.272 19.5384 70.8664L16.5422 70.7154C16.5223 71.1092 16.5 71.5465 16.5 71.9964H19.5ZM19.6361 75.5844C19.5553 74.3846 19.5 73.1917 19.5 71.9964H16.5C16.5 73.2821 16.5594 74.547 16.6429 75.7861L19.6361 75.5844ZM125.862 74.1853H18.1395V77.1853H125.862V74.1853ZM124.501 71.9964C124.501 73.1917 124.446 74.3846 124.365 75.5844L127.358 75.7861C127.442 74.547 127.501 73.2821 127.501 71.9964H124.501ZM124.365 68.4064C124.446 69.6082 124.501 70.8012 124.501 71.9964H127.501C127.501 70.7108 127.442 69.4458 127.358 68.2049L124.365 68.4064ZM66.9085 111.642H37.0505V114.642H66.9085V111.642ZM75.3939 117.325C72.7384 115.772 70.224 113.99 67.8796 111.998L65.9374 114.285C68.4154 116.39 71.073 118.273 73.8798 119.914L75.3939 117.325ZM99.2419 117.119H74.6368V120.119H99.2419V117.119ZM71.999 127.501C81.8425 127.513 91.5101 124.893 100.001 119.913L98.483 117.326C90.4537 122.035 81.3113 124.512 72.0026 124.501L71.999 127.501ZM47.6973 121.874C55.263 125.58 63.5768 127.505 72.0014 127.501L72.0002 124.501C64.0333 124.504 56.1714 122.684 49.0169 119.18L47.6973 121.874ZM48.3074 122.027H48.3571V119.027H48.3074V122.027ZM47.4194 121.751C47.4675 121.778 47.537 121.817 47.6115 121.856L49.0033 119.198C48.9723 119.182 48.9393 119.163 48.8856 119.133L47.4194 121.751ZM47.4077 121.744L47.4083 121.744L48.8967 119.14L48.8961 119.139L47.4077 121.744ZM47.427 121.755L47.4273 121.755L48.8765 119.128L48.8762 119.128L47.427 121.755ZM47.2849 121.677C47.3144 121.692 47.3482 121.711 47.4184 121.75L48.8848 119.133C48.8248 119.099 48.7297 119.046 48.6266 118.994L47.2849 121.677ZM46.7653 121.404C46.9196 121.488 47.1006 121.586 47.2889 121.679L48.6226 118.992C48.4892 118.926 48.3542 118.853 48.1922 118.766L46.7653 121.404ZM46.4745 121.249C46.5671 121.297 46.6605 121.348 46.7653 121.405L48.1922 118.766C48.0907 118.711 47.9777 118.65 47.862 118.589L46.4745 121.249ZM44.1834 120.005C44.9456 120.447 45.7171 120.857 46.4786 121.251L47.8579 118.587C47.1131 118.201 46.3897 117.816 45.6877 117.41L44.1834 120.005ZM44.1412 119.982C44.1496 119.986 44.1553 119.989 44.1607 119.992C44.1657 119.995 44.1689 119.997 44.1709 119.998C44.1751 120 44.1716 119.998 44.1638 119.994L45.7072 117.421C45.6353 117.378 45.5667 117.342 45.541 117.329L44.1412 119.982ZM44.2124 120.017L44.2125 120.017L45.4697 117.293L45.4696 117.293L44.2124 120.017ZM44.0045 119.907C44.0627 119.941 44.1174 119.969 44.1411 119.982L45.5408 117.329C45.5259 117.321 45.5187 117.317 45.5127 117.314C45.5075 117.311 45.5076 117.311 45.5109 117.313L44.0045 119.907ZM44.7788 117.11H44.7577V120.11H44.7788V117.11ZM36.0804 114.286C38.5587 116.387 41.2164 118.267 44.0227 119.905L45.5349 117.314C42.8798 115.765 40.3653 113.986 38.0206 111.998L36.0804 114.286ZM23.8206 97.875H53.6786V94.875H23.8206V97.875ZM28.3026 101.005C27.1502 99.2952 26.0987 97.5197 25.1537 95.6874L22.4874 97.0626C23.4861 98.9989 24.5972 100.875 25.8149 102.682L28.3026 101.005ZM27.0013 103.343H27.0587V100.343H27.0013V103.343ZM28.569 101.449C28.4376 101.276 28.3373 101.143 28.2482 101.009L25.7545 102.677C25.9009 102.896 26.055 103.099 26.1778 103.261L28.569 101.449ZM28.9033 101.903C28.7873 101.737 28.6681 101.58 28.569 101.449L26.1778 103.261C26.2826 103.399 26.3671 103.511 26.445 103.622L28.9033 101.903ZM29.2231 102.384C29.129 102.239 29.0184 102.067 28.9033 101.903L26.445 103.622C26.5237 103.735 26.6047 103.86 26.7046 104.014L29.2231 102.384ZM29.5513 102.873C29.4495 102.733 29.3482 102.577 29.2231 102.384L26.7046 104.014C26.8218 104.195 26.9666 104.42 27.1239 104.636L29.5513 102.873ZM28.3987 102.255H28.3376V105.255H28.3987V102.255ZM33.9994 108.198C32.4247 106.521 30.9604 104.744 29.6157 102.878L27.1817 104.631C28.6022 106.603 30.1491 108.48 31.8126 110.252L33.9994 108.198ZM111.087 107.725H32.906V110.725H111.087V107.725ZM115.744 101.012C114.042 103.567 112.121 105.968 110.002 108.189L112.173 110.26C114.412 107.913 116.442 105.375 118.241 102.675L115.744 101.012ZM56.911 103.343H116.992V100.343H56.911V103.343ZM52.3444 97.0605C53.34 98.9982 54.4496 100.875 55.6672 102.682L58.1549 101.005C57.0035 99.2966 55.9542 97.5217 55.0128 95.6895L52.3444 97.0605ZM48.4011 78.1055H18.5431V81.1055H48.4011V78.1055ZM50.9549 84.7003C50.5048 82.9495 50.1478 81.1761 49.8852 79.3876L46.917 79.8233C47.195 81.7166 47.5729 83.5939 48.0494 85.4472L50.9549 84.7003ZM124.398 83.5737H49.5021V86.5737H124.398V83.5737ZM123.365 93.0233C124.378 90.558 125.209 88.0223 125.853 85.4361L122.942 84.7114C122.333 87.156 121.547 89.553 120.59 91.8834L123.365 93.0233ZM22.0221 93.9533H121.978V90.9533H22.0221V93.9533ZM18.7111 87.3932C19.2502 89.2995 19.8909 91.1756 20.6306 93.0134L23.4136 91.8933C22.7139 90.1548 22.1078 88.3802 21.5979 86.5769L18.7111 87.3932ZM20.124 88.4851H20.1545V85.4851H20.124V88.4851ZM18.551 86.8838C18.5847 87.0268 18.6285 87.2143 18.6836 87.4039L21.5643 86.5662C21.5345 86.4636 21.5079 86.3522 21.4711 86.1961L18.551 86.8838ZM18.471 86.5605C18.4966 86.6537 18.5202 86.753 18.551 86.8838L21.4711 86.1961C21.4425 86.0744 21.4066 85.9212 21.3639 85.7659L18.471 86.5605ZM18.3459 86.1331C18.3936 86.2907 18.4341 86.4249 18.4702 86.5573L21.3648 85.7691C21.3159 85.5896 21.2631 85.4154 21.2174 85.2645L18.3459 86.1331ZM18.1483 85.4358C18.2114 85.6895 18.2851 85.9321 18.3459 86.1331L21.2174 85.2645C21.1531 85.0519 21.1016 84.8806 21.0596 84.7117L18.1483 85.4358ZM19.6441 83.5737H19.604V86.5737H19.6441V83.5737ZM17.0591 79.8241C17.3379 81.7167 17.7158 83.5934 18.1912 85.4465L21.0971 84.701C20.6478 82.9495 20.2906 81.1757 20.0271 79.3868L17.0591 79.8241Z"
          fill="url(#paint1_linear_11874_12891)"
          mask="url(#path-6-inside-1_11874_12891)"
        />
      </g>
      <rect
        x="18.75"
        y="18.75"
        width="106.5"
        height="106.5"
        rx="53.25"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_11874_12891"
          x1="18"
          y1="71.9996"
          x2="126"
          y2="71.9996"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_11874_12891"
          x1="18"
          y1="71.9996"
          x2="126"
          y2="71.9996"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_11874_12891">
          <rect
            x="18"
            y="18"
            width="108"
            height="108"
            rx="54"
            fill="currentColor"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
