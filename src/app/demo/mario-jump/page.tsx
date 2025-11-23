'use client'

import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

const MarioJumpDemo = dynamic(
    () => import('@/components/demos/mario-jump').then((mod) => ({ default: mod.MarioJumpDemo })),
    { ssr: false }
);

export default function MarioJumpDemoPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            돌아가기
                        </Button>
                    </Link>

                    {/* Introduction */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                점프 메커니즘이란?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <p>
                                슈퍼마리오의 점프가 "느낌이 좋다"고 느껴지는 이유는 단순히 위로 올라갔다 내려오는 것이 아니라,
                                <strong> 다양한 보조 메커니즘</strong>들이 적용되어 있기 때문입니다.
                            </p>
                            <p>
                                플랫포머 게임에서 점프의 "게임 필"을 결정하는 핵심 요소들:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>가변 높이 점프</strong>: 버튼을 누르는 시간에 따라 점프 높이가 달라짐</li>
                                <li><strong>코요테 타임</strong>: 플랫폼을 벗어난 직후에도 점프 가능 (실수 보정)</li>
                                <li><strong>점프 버퍼링</strong>: 착지 직전 입력을 기억해 자동 점프 (연속 점프 용이)</li>
                                <li><strong>중력 배율</strong>: 상승/하강 시 다른 중력 적용 (빠른 하강감)</li>
                            </ul>
                            <p>
                                아래 데모에서 각 방식의 차이를 직접 체험해보세요!
                            </p>
                        </CardContent>
                    </Card>

                    {/* Demo */}
                    <MarioJumpDemo />

                    {/* Tips */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-lg">실험해보기</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p>• <strong>기본 점프</strong>에서 시작해 각 방식의 차이를 느껴보세요.</p>
                            <p>• <strong>가변 높이 점프</strong>에서 짧게/길게 눌러 높이 차이를 확인하세요.</p>
                            <p>• <strong>코요테 타임</strong>에서 플랫폼 끝에서 떨어지며 점프해보세요.</p>
                            <p>• <strong>점프 버퍼링</strong>에서 착지 직전에 점프를 미리 입력해보세요.</p>
                            <p>• 실제 게임에서는 이 기법들을 조합하여 사용합니다!</p>
                        </CardContent>
                    </Card>

                    {/* References */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-lg">참고 자료</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p>• <strong>Celeste</strong> - 코요테 타임과 점프 버퍼링의 교과서적 구현</p>
                            <p>• <strong>Hollow Knight</strong> - 반응성 높은 점프와 부드러운 곡선</p>
                            <p>• <strong>Super Meat Boy</strong> - 극도로 정밀한 공중 제어</p>
                            <p>• <strong>Original Super Mario Bros.</strong> - 가변 높이 점프의 원조</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
