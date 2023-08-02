import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    backgroundColor: 'white',
                    backgroundImage:
                        'radial-gradient(circle at 25px 25px, purple 5%, transparent 0%), radial-gradient(circle at 75px 75px, blue 3%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg
                        height={80}
                        viewBox="0 0 75 65"
                        fill="black"
                        style={{ margin: '0 75px' }}
                    >
                        <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
                    </svg>
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 52,
                        fontStyle: 'normal',
                        color: 'black',
                        marginTop: 30,
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    <b>Justin Edwards</b>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 600,
        },
    );
}
